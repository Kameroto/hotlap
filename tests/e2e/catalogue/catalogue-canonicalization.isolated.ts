import type { CDPSession, Page, TestInfo } from '@playwright/test';
import { test, expect, type CanonicalRedirectObservation } from './catalogue-test';
import {
  explicitDefaultsPath, explicitDefaultsTitle, isDiagnosticUrl,
  type DocumentFields, type NavigationEvidence, type NavigationEvent,
} from './canonical-redirect-classification';

const featuredOrder = ['Fir', 'Alder', 'Cedar', 'Birch', 'Dune', 'Elm'];
const unmatchedSearch = 'Zynthrax Nebuloom';

function catalogue(page: Page) {
  const main = page.getByRole('main');
  return {
    main,
    articles: main.getByRole('article'),
    pagination: main.getByRole('navigation', { name: 'Product pagination', exact: true }),
    search: main.getByRole('searchbox', { name: 'Search products', exact: true }),
    sort: main.getByRole('combobox', { name: 'Sort by', exact: true }),
    allItems: main.getByRole('button', { name: 'All Items', exact: true }),
  };
}

async function openCatalogue(page: Page, path: string, requests: readonly { disposition: string }[]) {
  await page.goto(path);
  await expect.poll(() => requests.some(request => request.disposition === 'mock-auth')).toBe(true);
  await expect.poll(() => requests.some(request => request.disposition === 'mock-cart')).toBe(true);
}

async function expectCatalogueUrl(page: Page, params: Record<string, string> = {}) {
  const expected = new URLSearchParams(params);
  expected.sort();
  await expect(page).toHaveURL(url => {
    const actual = new URLSearchParams(url.search);
    actual.sort();
    return url.origin === 'http://127.0.0.1:3100' && url.pathname === '/products' &&
      url.hash === '' && actual.toString() === expected.toString();
  });
}

async function expectUnpaginatedResults(page: Page, order: readonly string[]) {
  const { main, articles, pagination } = catalogue(page);
  await expect(articles).toHaveCount(order.length);
  if (order.length > 0) {
    await expect(articles.getByRole('heading', { level: 3 }))
      .toHaveText(order.map(name => `E2E Catalogue ${name}`));
  }
  await expect(main.locator('#product-results')
    .getByText(`${order.length} products found`, { exact: true })).toBeVisible();
  await expect(pagination).toHaveCount(0);
}

async function expectDefaultCatalogue(page: Page) {
  const { allItems, search, sort } = catalogue(page);
  await expectCatalogueUrl(page);
  await expect(sort).toHaveValue('featured');
  await expect(allItems).toHaveAttribute('aria-pressed', 'true');
  await expect(search).toHaveValue('');
  await expectUnpaginatedResults(page, featuredOrder);
}

test.beforeEach(() => {
  test.setTimeout(60_000);
});

async function observeCanonicalRedirect(
  page: Page, testInfo: TestInfo, observation: CanonicalRedirectObservation, run: () => Promise<void>,
) {
  const limit = 128;
  const events: (NavigationEvent & { sequence: number })[] = [];
  const requests = new Map<string, DocumentFields>();
  const errors: unknown[] = [];
  let session: CDPSession | undefined;
  let mainFrameId: string | undefined;
  let scheduledUrl: string | undefined;
  let truncated = false;
  let observing = false;
  let unrecognizedNavigation = false;
  let committedUrl: string | undefined;
  let setupComplete = false;
  let sessionDetached = false;
  let functionalAssertionsCompleted = false;

  function record(event: NavigationEvent) {
    if (!observing) return false;
    if (events.length >= limit) {
      truncated = true;
      return false;
    }
    events.push({ sequence: events.length + 1, ...event });
    return true;
  }

  function isObservedNavigation(frameId: string, url: string) {
    if (!observing || frameId !== mainFrameId) return false;
    if (isDiagnosticUrl(url)) return true;
    unrecognizedNavigation = true;
    return false;
  }

  try {
    session = await page.context().newCDPSession(page);
    await session.send('Page.enable');
    const { frameTree } = await session.send('Page.getFrameTree');
    mainFrameId = frameTree.frame.id;
    committedUrl = frameTree.frame.url;

    session.on('Page.frameRequestedNavigation', ({ frameId, url, reason, disposition }) => {
      if (isObservedNavigation(frameId, url)) {
        record({ event: 'Page.frameRequestedNavigation', frameId, url, reason, disposition });
      }
    });
    session.on('Page.frameScheduledNavigation', ({ frameId, url, reason, delay }) => {
      if (!observing || frameId !== mainFrameId) return;
      scheduledUrl = isObservedNavigation(frameId, url) ? url : undefined;
      if (scheduledUrl) record({ event: 'Page.frameScheduledNavigation', frameId, url, reason, delay });
    });
    session.on('Page.frameClearedScheduledNavigation', ({ frameId }) => {
      if (frameId !== mainFrameId || !scheduledUrl) return;
      record({ event: 'Page.frameClearedScheduledNavigation', frameId, url: scheduledUrl });
      scheduledUrl = undefined;
    });
    session.on('Page.frameStartedNavigating', ({ frameId, loaderId, url, navigationType }) => {
      if (isObservedNavigation(frameId, url)) {
        record({ event: 'Page.frameStartedNavigating', frameId, loaderId, url, navigationType });
      }
    });
    session.on('Page.frameNavigated', ({ frame, type }) => {
      const url = frame.url + (frame.urlFragment ?? '');
      if (isObservedNavigation(frame.id, url)) {
        committedUrl = url;
        if (frame.unreachableUrl) unrecognizedNavigation = true;
        record({ event: 'Page.frameNavigated', frameId: frame.id, loaderId: frame.loaderId, url, navigationType: type });
      }
    });

    session.on('Page.navigatedWithinDocument', ({ frameId, url }) => {
      if (observing && frameId === mainFrameId && url !== committedUrl) unrecognizedNavigation = true;
    });

    session.on('Network.requestWillBeSent', event => {
      const { requestId, frameId, loaderId, request, type, initiator, timestamp, wallTime, redirectResponse } = event;
      if (!observing || !frameId || frameId !== mainFrameId || type !== 'Document') return;
      // The approved streamed redirect does not reuse a request ID or carry an HTTP redirect response.
      if (requests.has(requestId) || redirectResponse) unrecognizedNavigation = true;
      if (!isObservedNavigation(frameId, request.url)) return;

      const fields = { requestId, frameId, loaderId, url: request.url, resourceType: type, method: request.method };
      const redirectFrom = redirectResponse && isDiagnosticUrl(redirectResponse.url) ? redirectResponse.url : undefined;
      if (record({ event: 'Network.requestWillBeSent',
        ...fields, timestamp, wallTime, initiatorType: initiator.type,
        redirectFrom, redirectStatus: redirectFrom ? redirectResponse?.status : undefined,
      })) {
        requests.set(requestId, fields);
      }
    });
    session.on('Network.responseReceived', ({ requestId, loaderId, timestamp, type, response }) => {
      const request = requests.get(requestId);
      if (!observing || !request) return;
      if (type !== 'Document' || request.loaderId !== loaderId || request.url !== response.url) {
        unrecognizedNavigation = true;
        return;
      }
      record({ event: 'Network.responseReceived', ...request, timestamp, status: response.status });
    });
    session.on('Network.loadingFinished', ({ requestId, timestamp }) => {
      const request = requests.get(requestId);
      if (!request) return;
      record({ event: 'Network.loadingFinished', ...request, timestamp });
    });
    session.on('Network.loadingFailed', ({ requestId, timestamp, errorText, canceled, blockedReason }) => {
      const request = requests.get(requestId);
      if (!request) return;
      record({ event: 'Network.loadingFailed',
        ...request, timestamp, canceled, blockedReason,
        errorText: /^net::ERR_[A-Z0-9_]+$/.test(errorText) ? errorText : '[redacted]',
      });
    });

    await session.send('Network.enable');
    setupComplete = true;
    observing = true;
    observation.start();
    await run();
    functionalAssertionsCompleted = true;
  } catch (error) {
    errors.push(error);
  } finally {
    observing = false;
    observation.stop();
    const finalUrl = page.url();
    if (session) {
      try {
        await session.detach();
        sessionDetached = true;
      } catch (error) {
        errors.push(error);
      }
    }
    const diagnostic: NavigationEvidence = {
      mainFrameId, setupComplete, sessionDetached, eventLimit: limit, truncated, unrecognizedNavigation,
      finalMainFrameUrl: isDiagnosticUrl(finalUrl) ? finalUrl : undefined,
      events,
    };
    let attached = false;
    try {
      await testInfo.attach('canonical-redirect-navigation', {
        contentType: 'application/json',
        body: JSON.stringify(diagnostic, null, 2),
      });
      attached = true;
    } catch (error) {
      errors.push(error);
    }
    observation.complete(attached ? diagnostic : undefined, functionalAssertionsCompleted);
  }

  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) {
    throw new AggregateError(errors, errors.map(error => String(error)).join('\n'));
  }
}

test(explicitDefaultsTitle, async ({ page, safety, catalogueSafety }, testInfo) => {
  const observation = catalogueSafety.authorizeCanonicalRedirect('explicit-defaults-redirect');
  await observeCanonicalRedirect(page, testInfo, observation, async () => {
    await openCatalogue(page, explicitDefaultsPath, safety.requests);
    await expectDefaultCatalogue(page);
  });
});

test('duplicate catalogue parameters retain only the first normalized search and category', async ({ page, safety }) => {
  await openCatalogue(
    page,
    '/products?search=%20ORBIT%20&search=ignored&category=e2e-fixture-alpha&category=e2e-fixture-beta&sort=price-low-high',
    safety.requests,
  );
  const { main, search, sort } = catalogue(page);

  await expectCatalogueUrl(page, { search: 'ORBIT', category: 'e2e-fixture-alpha', sort: 'price-low-high' });
  await expect(search).toHaveValue('ORBIT');
  await expect(main.getByRole('button', { name: 'E2E Fixture Alpha (3)', exact: true }))
    .toHaveAttribute('aria-pressed', 'true');
  await expect(sort).toHaveValue('price-low-high');
  await expectUnpaginatedResults(page, ['Alder', 'Elm']);
});

test('an invalid catalogue category resets the page and preserves valid search and sort', async ({ page, safety }) => {
  await openCatalogue(
    page,
    '/products?category=e2e-nonexistent-category&search=ORBIT&sort=price-low-high&page=99',
    safety.requests,
  );
  const { allItems, search, sort } = catalogue(page);

  await expectCatalogueUrl(page, { search: 'ORBIT', sort: 'price-low-high' });
  await expect(allItems).toHaveAttribute('aria-pressed', 'true');
  await expect(search).toHaveValue('ORBIT');
  await expect(sort).toHaveValue('price-low-high');
  await expectUnpaginatedResults(page, ['Birch', 'Alder', 'Elm']);
});

test('a numeric-prefix page beyond the catalogue recovers to page one and preserves sort', async ({ page, safety }) => {
  await openCatalogue(page, '/products?page=2abc&sort=price-high-low', safety.requests);
  const { sort } = catalogue(page);

  await expectCatalogueUrl(page, { sort: 'price-high-low' });
  await expect(sort).toHaveValue('price-high-low');
  await expectUnpaginatedResults(page, ['Cedar', 'Elm', 'Fir', 'Alder', 'Dune', 'Birch']);
});

test('a zero-result page overflow retains search and sort until Clear all filters', async ({ page, safety }) => {
  await openCatalogue(
    page,
    '/products?search=Zynthrax%20Nebuloom&sort=price-low-high&page=99',
    safety.requests,
  );
  const { main, search, sort } = catalogue(page);

  await expectCatalogueUrl(page, { search: unmatchedSearch, sort: 'price-low-high' });
  await expect(search).toHaveValue(unmatchedSearch);
  await expect(sort).toHaveValue('price-low-high');
  await expectUnpaginatedResults(page, []);
  await expect(main.getByRole('heading', { name: 'No matching products', exact: true })).toBeVisible();
  await expect(main.getByText(
    `No products matched “${unmatchedSearch}”. Try a broader product name, brand, or SKU.`,
    { exact: true },
  )).toBeVisible();

  const clearAll = main.getByRole('link', { name: 'Clear all filters', exact: true });
  await expect(clearAll).toBeVisible();
  await expect(clearAll).toHaveAttribute('href', '/products');
  await clearAll.click();
  await expectDefaultCatalogue(page);
});
