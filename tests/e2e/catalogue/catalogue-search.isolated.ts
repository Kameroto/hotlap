import type { Page } from '@playwright/test';
import { test, expect } from './catalogue-test';

const featuredOrder = ['Fir', 'Alder', 'Cedar', 'Birch', 'Dune', 'Elm'];
const orbitFeaturedOrder = ['Alder', 'Birch', 'Elm'];
const priceOrder = ['Birch', 'Dune', 'Alder', 'Fir', 'Elm', 'Cedar'];

function catalogue(page: Page) {
  const main = page.getByRole('main');
  return {
    main,
    articles: main.getByRole('article'),
    search: main.getByRole('searchbox', { name: 'Search products', exact: true }),
  };
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

async function expectProducts(page: Page, order: string[]) {
  const { main, articles } = catalogue(page);
  await expect(articles).toHaveCount(order.length);
  if (order.length > 0) {
    await expect(articles.getByRole('heading', { level: 3 }))
      .toHaveText(order.map(name => `E2E Catalogue ${name}`));
  }
  const count = `${order.length} ${order.length === 1 ? 'product' : 'products'} found`;
  await expect(main.locator('#product-results').getByText(count, { exact: true })).toBeVisible();
}

test.beforeEach(async ({ page, safety }) => {
  test.setTimeout(60_000);
  const response = await page.goto('/products');
  expect(response?.status()).toBe(200);
  await expectCatalogueUrl(page);
  await expectProducts(page, featuredOrder);
  await expect(catalogue(page).search).toHaveValue('');
  await expect.poll(() => safety.requests.some(request => request.disposition === 'mock-auth')).toBe(true);
  await expect.poll(() => safety.requests.some(request => request.disposition === 'mock-cart')).toBe(true);
});

test('catalogue search matches ORBIT case-insensitively and clearing restores featured products', async ({ page }) => {
  const { search } = catalogue(page);
  await search.fill('ORBIT');
  await expectCatalogueUrl(page, { search: 'ORBIT' });
  await expectProducts(page, orbitFeaturedOrder);
  await expect(search).toHaveValue('ORBIT');

  await search.clear();
  await expectCatalogueUrl(page);
  await expectProducts(page, featuredOrder);
  await expect(search).toHaveValue('');
});

const categoryScenarios = [
  { name: 'Alpha', slug: 'e2e-fixture-alpha', matches: ['Alder', 'Elm'], restored: ['Alder', 'Cedar', 'Elm'] },
  { name: 'Beta', slug: 'e2e-fixture-beta', matches: ['Birch'], restored: ['Fir', 'Birch', 'Dune'] },
];

for (const { name, slug, matches, restored } of categoryScenarios) {
  test(`catalogue search preserves the ${name} category through search and clearing`, async ({ page }) => {
    const { main, search } = catalogue(page);
    const category = main.getByRole('button', { name: `E2E Fixture ${name} (3)`, exact: true });
    await category.click();
    await expectCatalogueUrl(page, { category: slug });
    await expectProducts(page, restored);

    await search.fill('ORBIT');
    await expectCatalogueUrl(page, { category: slug, search: 'ORBIT' });
    await expectProducts(page, matches);
    await expect(category).toHaveAttribute('aria-pressed', 'true');

    await search.clear();
    await expectCatalogueUrl(page, { category: slug });
    await expectProducts(page, restored);
    await expect(category).toHaveAttribute('aria-pressed', 'true');
    await expect(search).toHaveValue('');
  });
}

test('catalogue search preserves ascending price order through search and clearing', async ({ page }) => {
  const { main, search } = catalogue(page);
  const sort = main.getByRole('combobox', { name: 'Sort by', exact: true });
  await sort.selectOption('price-low-high');
  await expectCatalogueUrl(page, { sort: 'price-low-high' });
  await expectProducts(page, priceOrder);

  await search.fill('ORBIT');
  await expectCatalogueUrl(page, { sort: 'price-low-high', search: 'ORBIT' });
  await expectProducts(page, ['Birch', 'Alder', 'Elm']);
  await expect(sort).toHaveValue('price-low-high');

  await search.clear();
  await expectCatalogueUrl(page, { sort: 'price-low-high' });
  await expectProducts(page, priceOrder);
  await expect(sort).toHaveValue('price-low-high');
  await expect(search).toHaveValue('');
});

test('an unmatched catalogue search shows the empty state and Clear all filters restores products', async ({ page }) => {
  const { main, search } = catalogue(page);
  const unmatched = 'Zynthrax Nebuloom';
  await search.fill(unmatched);
  await expectCatalogueUrl(page, { search: unmatched });
  await expectProducts(page, []);
  await expect(main.getByRole('heading', { name: 'No matching products', exact: true })).toBeVisible();
  await expect(main.getByText(
    `No products matched “${unmatched}”. Try a broader product name, brand, or SKU.`,
    { exact: true },
  )).toBeVisible();

  const clearAll = main.getByRole('link', { name: 'Clear all filters', exact: true });
  await expect(clearAll).toHaveAttribute('href', '/products');
  await clearAll.click();
  await expectCatalogueUrl(page);
  await expectProducts(page, featuredOrder);
  await expect(search).toHaveValue('');
});

test('catalogue search keeps focus and caret after committing a partial query', async ({ page }) => {
  const { main, search } = catalogue(page);
  await search.click();
  await page.keyboard.type('OR');

  await expectCatalogueUrl(page, { search: 'OR' });
  await expect(main.getByRole('heading', { name: 'Search results for “OR”', exact: true })).toBeVisible();
  await expectProducts(page, featuredOrder);
  await expect(search).toHaveValue('OR');
  await expect(search).toBeFocused();
  await expect(search).toHaveJSProperty('selectionStart', 2);
  await expect(search).toHaveJSProperty('selectionEnd', 2);

  await page.keyboard.type('BIT');
  await expect(search).toHaveValue('ORBIT');
  await expectCatalogueUrl(page, { search: 'ORBIT' });
  await expectProducts(page, orbitFeaturedOrder);
  await expect(search).toHaveValue('ORBIT');
});

test('Clear filters synchronizes the searchbox without moving focus to it', async ({ page }) => {
  const { main, search } = catalogue(page);
  await search.fill('ORBIT');
  await expectCatalogueUrl(page, { search: 'ORBIT' });
  await expectProducts(page, orbitFeaturedOrder);
  await expect(search).toHaveValue('ORBIT');

  const clearFilters = main.getByRole('link', { name: 'Clear filters', exact: true });
  await clearFilters.focus();
  await expect(clearFilters).toBeFocused();
  await page.keyboard.press('Enter');

  await expectCatalogueUrl(page);
  await expect(search).toHaveValue('');
  await expectProducts(page, featuredOrder);
  await expect(search).not.toBeFocused();
});

test('Back and Forward synchronize the searchbox with catalogue history', async ({ page }) => {
  const { main, search } = catalogue(page);
  const category = main.getByRole('button', { name: 'E2E Fixture Alpha (3)', exact: true });
  await category.click();
  await expectCatalogueUrl(page, { category: 'e2e-fixture-alpha' });
  await expect(category).toHaveAttribute('aria-pressed', 'true');

  await search.fill('ORBIT');
  await expectCatalogueUrl(page, { category: 'e2e-fixture-alpha', search: 'ORBIT' });
  await expect(search).toHaveValue('ORBIT');
  await expectProducts(page, ['Alder', 'Elm']);

  await page.goBack();
  await expectCatalogueUrl(page);
  await expect(search).toHaveValue('');
  await expectProducts(page, featuredOrder);

  await page.goForward();
  await expectCatalogueUrl(page, { category: 'e2e-fixture-alpha', search: 'ORBIT' });
  await expect(search).toHaveValue('ORBIT');
  await expect(category).toHaveAttribute('aria-pressed', 'true');
  await expectProducts(page, ['Alder', 'Elm']);
});

async function enterPendingOrbitSearch(page: Page) {
  const clockStart = Date.now();
  await page.clock.install({ time: clockStart });
  await page.clock.pauseAt(clockStart + 60_000);

  const { search } = catalogue(page);
  await search.fill('ORBIT');
  await expect(search).toHaveValue('ORBIT');
  await expectCatalogueUrl(page);
}

test('a pending catalogue search survives selecting the Alpha category', async ({ page }) => {
  const { main, search } = catalogue(page);
  const category = main.getByRole('button', { name: 'E2E Fixture Alpha (3)', exact: true });
  await enterPendingOrbitSearch(page);

  // Keyboard activation avoids a pointer action's animation-frame stability check.
  await category.press('Enter');
  await expect(page).toHaveURL(url => url.pathname === '/products' &&
    url.searchParams.get('category') === 'e2e-fixture-alpha');
  await expect(category).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(350);
  await page.clock.resume();

  await expectCatalogueUrl(page, { category: 'e2e-fixture-alpha', search: 'ORBIT' });
  await expect(search).toHaveValue('ORBIT');
  await expect(category).toHaveAttribute('aria-pressed', 'true');
  await expectProducts(page, ['Alder', 'Elm']);
});

test('a pending catalogue search survives selecting ascending price order', async ({ page }) => {
  const { main, search } = catalogue(page);
  const sort = main.getByRole('combobox', { name: 'Sort by', exact: true });
  await enterPendingOrbitSearch(page);

  await sort.selectOption('price-low-high');
  await expect(page).toHaveURL(url => url.pathname === '/products' &&
    url.searchParams.get('sort') === 'price-low-high');
  await page.clock.runFor(350);
  await page.clock.resume();

  await expectCatalogueUrl(page, { sort: 'price-low-high', search: 'ORBIT' });
  await expect(search).toHaveValue('ORBIT');
  await expect(sort).toHaveValue('price-low-high');
  await expectProducts(page, ['Birch', 'Alder', 'Elm']);
});

async function expireSearchDebounceDuringFilterNavigation(
  page: Page,
  filter: 'category' | 'sort',
  value: string,
  selectFilter: () => Promise<unknown>,
) {
  await enterPendingOrbitSearch(page);
  const { search } = catalogue(page);
  const matchesUrl = (url: URL) => url.origin === 'http://127.0.0.1:3100' &&
    url.pathname === '/products' && url.searchParams.size === 2 &&
    url.searchParams.get(filter) === value && Boolean(url.searchParams.get('_rsc'));

  const barrier = Promise.withResolvers<void>();
  let held = false;
  let released = false;
  const holdNavigation: Parameters<Page['route']>[1] = async route => {
    const request = route.request();
    const headers = request.headers();
    if (!released && request.method() === 'GET' && headers.rsc === '1' && headers['next-router-state-tree'] &&
      !headers['next-router-prefetch'] && !headers['next-router-segment-prefetch']) {
      held = true;
      await barrier.promise;
    }
    await route.fallback();
  };

  try {
    await page.route(matchesUrl, holdNavigation);
    await selectFilter();
    await expect.poll(() => held, { message: `Wait for the live ${filter} RSC navigation to reach the barrier` })
      .toBe(true);
    await expectCatalogueUrl(page);
    await expect(search).toHaveValue('ORBIT');
    await page.clock.runFor(350);
  } finally {
    released = true;
    barrier.resolve();
    // The fresh context disposes the handler after the downstream routing handoff.
    await page.clock.resume();
  }
}

test('catalogue search and Alpha survive a debounce expiring during category navigation', async ({ page }) => {
  const { main, search } = catalogue(page);
  const category = main.getByRole('button', { name: 'E2E Fixture Alpha (3)', exact: true });
  await expireSearchDebounceDuringFilterNavigation(page, 'category', 'e2e-fixture-alpha', () =>
    category.press('Enter'));

  await expectCatalogueUrl(page, { category: 'e2e-fixture-alpha', search: 'ORBIT' });
  await expect(search).toHaveValue('ORBIT');
  await expect(category).toHaveAttribute('aria-pressed', 'true');
  await expectProducts(page, ['Alder', 'Elm']);
});

test('catalogue search and ascending price survive a debounce expiring during sort navigation', async ({ page }) => {
  const { main, search } = catalogue(page);
  const sort = main.getByRole('combobox', { name: 'Sort by', exact: true });
  await expireSearchDebounceDuringFilterNavigation(page, 'sort', 'price-low-high', () =>
    sort.selectOption('price-low-high'));

  await expectCatalogueUrl(page, { sort: 'price-low-high', search: 'ORBIT' });
  await expect(search).toHaveValue('ORBIT');
  await expect(sort).toHaveValue('price-low-high');
  await expectProducts(page, ['Birch', 'Alder', 'Elm']);
});
