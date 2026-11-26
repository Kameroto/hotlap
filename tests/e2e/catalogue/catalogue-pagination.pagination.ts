import type { Page } from '@playwright/test';
import { test, expect } from './catalogue-test';

const featuredFirst = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const featuredLast = ['13', '14', '15', '16'];
const priceFirst = ['16', '15', '14', '13', '12', '11', '10', '09', '08', '07', '06', '05'];
const priceLast = ['04', '03', '02', '01'];
const filteredPriceFirst = ['13', '12', '11', '10', '09', '08', '07', '06', '05', '04', '03', '02'];
const alpha = { category: 'e2e-pagination-alpha' };
const beta = { category: 'e2e-pagination-beta' };
const orbit = { search: 'ORBIT' };
const ascending = { sort: 'price-low-high' };
const combined = { ...alpha, ...orbit, ...ascending };
const combinedPath = '/products?category=e2e-pagination-alpha&search=ORBIT&sort=price-low-high';

function catalogue(page: Page) {
  const main = page.getByRole('main');
  const pagination = main.getByRole('navigation', { name: 'Product pagination', exact: true });
  return {
    main,
    pagination,
    search: main.getByRole('searchbox', { name: 'Search products', exact: true }),
    sort: main.getByRole('combobox', { name: 'Sort by', exact: true }),
    alphaButton: main.getByRole('button', { name: 'E2E Pagination Alpha (14)', exact: true }),
    betaButton: main.getByRole('button', { name: 'E2E Pagination Beta (2)', exact: true }),
    previous: pagination.getByRole('link', { name: 'Go to previous product page', exact: true }),
    next: pagination.getByRole('link', { name: 'Go to next product page', exact: true }),
    numbered: (number: 1 | 2) => pagination.getByRole('link', { name: `Go to product page ${number}`, exact: true }),
  };
}

async function openCatalogue(page: Page, path: string, requests: readonly { disposition: string }[]) {
  const count = (disposition: string) => requests.filter(request => request.disposition === disposition).length;
  const auth = count('mock-auth');
  const cart = count('mock-cart');
  await page.goto(path);
  await expect.poll(() => count('mock-auth')).toBeGreaterThan(auth);
  await expect.poll(() => count('mock-cart')).toBeGreaterThan(cart);
}

async function expectCatalogueUrl(page: Page, params: Record<string, string>) {
  const expected = new URLSearchParams(params);
  expected.sort();
  await expect(page).toHaveURL(url => {
    const actual = new URLSearchParams(url.search);
    actual.sort();
    return url.origin === 'http://127.0.0.1:3100' && url.pathname === '/products' &&
      url.hash === '' && actual.toString() === expected.toString();
  });
}

async function expectProducts(page: Page, order: readonly string[], total: number) {
  const { main } = catalogue(page);
  const articles = main.getByRole('article');
  await expect(articles).toHaveCount(order.length);
  if (order.length > 0) {
    await expect(articles.getByRole('heading', { level: 3 }))
      .toHaveText(order.map(number => `E2E Pagination Product ${number}`));
  }
  await expect(main.locator('#product-results')
    .getByText(`${total} products found`, { exact: true })).toBeVisible();
}

async function expectDesktopPage(
  page: Page, number: 1 | 2, order: readonly string[], total: number, filters: Record<string, string> = {},
) {
  await expectCatalogueUrl(page, number === 1 ? filters : { ...filters, page: '2' });
  await expectProducts(page, order, total);

  const { pagination, next, previous, numbered } = catalogue(page);
  const first = number === 1;
  await expect(pagination).toBeVisible();
  await expect(pagination.locator('span[aria-current="page"]:visible')).toHaveText(String(number));
  await expect(numbered(first ? 2 : 1)).toBeVisible();
  await expect(first ? next : previous).toBeVisible();
  await expect(first ? previous : next).toHaveCount(0);
  await expect(pagination.locator('span[aria-disabled="true"]:visible'))
    .toHaveText(first ? 'Previous' : 'Next');
}

async function expectMobilePage(page: Page, number: 1 | 2, order: readonly string[]) {
  await expectCatalogueUrl(page, number === 1 ? {} : { page: '2' });
  await expectProducts(page, order, 16);

  const { pagination, next, previous, numbered } = catalogue(page);
  await expect(pagination).toBeVisible();
  await expect(pagination.getByText(`Page ${number} of 2`, { exact: true })).toBeVisible();
  await expect(numbered(1)).toHaveCount(0);
  await expect(numbered(2)).toHaveCount(0);
  await expect(pagination.locator('span[aria-current="page"]')).toBeHidden();
  await expect(number === 1 ? next : previous).toBeVisible();
  await expect(number === 1 ? previous : next).toHaveCount(0);
  await expect(pagination.locator('span[aria-disabled="true"]:visible')).toBeVisible();
}

async function expectCombinedFilters(page: Page) {
  const { alphaButton, search, sort } = catalogue(page);
  await expect(alphaButton).toHaveAttribute('aria-pressed', 'true');
  await expect(search).toHaveValue(orbit.search);
  await expect(sort).toHaveValue(ascending.sort);
}

test.beforeEach(() => {
  test.setTimeout(60_000);
});

test('desktop pagination follows direction and number links and respects both boundaries', async ({ page, safety }) => {
  await openCatalogue(page, '/products', safety.requests);
  const { next, previous, numbered } = catalogue(page);

  await expectDesktopPage(page, 1, featuredFirst, 16);
  await next.click();
  await expectDesktopPage(page, 2, featuredLast, 16);
  await previous.click();
  await expectDesktopPage(page, 1, featuredFirst, 16);
  await numbered(2).click();
  await expectDesktopPage(page, 2, featuredLast, 16);
  await numbered(1).click();
  await expectDesktopPage(page, 1, featuredFirst, 16);
});

test('mobile pagination shows its page indicator and usable direction links', async ({ page, safety }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCatalogue(page, '/products', safety.requests);
  const { next, previous } = catalogue(page);

  await expectMobilePage(page, 1, featuredFirst);
  await next.click();
  await expectMobilePage(page, 2, featuredLast);
  await previous.click();
  await expectMobilePage(page, 1, featuredFirst);
});

test('category pagination preserves Alpha and its total matching count', async ({ page, safety }) => {
  await openCatalogue(page, '/products', safety.requests);
  const { alphaButton, next, previous } = catalogue(page);

  await alphaButton.click();
  await expectDesktopPage(page, 1, featuredFirst, 14, alpha);
  await expect(alphaButton).toHaveAttribute('aria-pressed', 'true');
  await next.click();
  await expectDesktopPage(page, 2, ['13', '14'], 14, alpha);
  await expect(alphaButton).toHaveAttribute('aria-pressed', 'true');
  await previous.click();
  await expectDesktopPage(page, 1, featuredFirst, 14, alpha);
  await expect(alphaButton).toHaveAttribute('aria-pressed', 'true');
});

test('search pagination preserves ORBIT and its total matching count', async ({ page, safety }) => {
  await openCatalogue(page, '/products', safety.requests);
  const { search, next, previous } = catalogue(page);

  await search.fill(orbit.search);
  await expectDesktopPage(page, 1, featuredFirst, 13, orbit);
  await expect(search).toHaveValue(orbit.search);
  await next.click();
  await expectDesktopPage(page, 2, ['13'], 13, orbit);
  await expect(search).toHaveValue(orbit.search);
  await previous.click();
  await expectDesktopPage(page, 1, featuredFirst, 13, orbit);
  await expect(search).toHaveValue(orbit.search);
});

test('ascending price order is preserved across both catalogue pages', async ({ page, safety }) => {
  await openCatalogue(page, '/products', safety.requests);
  const { sort, next, previous } = catalogue(page);

  await sort.selectOption(ascending.sort);
  await expectDesktopPage(page, 1, priceFirst, 16, ascending);
  await expect(sort).toHaveValue(ascending.sort);
  await next.click();
  await expectDesktopPage(page, 2, priceLast, 16, ascending);
  await expect(sort).toHaveValue(ascending.sort);
  await previous.click();
  await expectDesktopPage(page, 1, priceFirst, 16, ascending);
  await expect(sort).toHaveValue(ascending.sort);
});

test('changing search, category or sort resets a committed second page', async ({ page, safety }) => {
  // Three independent deep links and their subsequent filter transitions share this test.
  test.setTimeout(120_000);
  const { search, sort, alphaButton, betaButton, next, pagination } = catalogue(page);

  await test.step('search resets pagination', async () => {
    await openCatalogue(page, '/products?page=2', safety.requests);
    await expectDesktopPage(page, 2, featuredLast, 16);

    await search.fill(orbit.search);
    await expectDesktopPage(page, 1, featuredFirst, 13, orbit);
    await expect(search).toHaveValue(orbit.search);
  });

  await test.step('category resets pagination while preserving search and sort', async () => {
    await openCatalogue(page, '/products?search=ORBIT&sort=price-low-high&page=2', safety.requests);
    await expectDesktopPage(page, 2, ['01'], 13, { ...orbit, ...ascending });
    await expect(search).toHaveValue(orbit.search);
    await expect(sort).toHaveValue(ascending.sort);

    await alphaButton.click();
    await expectDesktopPage(page, 1, filteredPriceFirst, 13, combined);
    await expectCombinedFilters(page);
    await next.click();
    await expectDesktopPage(page, 2, ['01'], 13, combined);

    await betaButton.click();
    await expectCatalogueUrl(page, { ...beta, ...orbit, ...ascending });
    await expect(betaButton).toHaveAttribute('aria-pressed', 'true');
    await expect(search).toHaveValue(orbit.search);
    await expect(sort).toHaveValue(ascending.sort);
    await expectProducts(page, [], 0);
    await expect(pagination).toHaveCount(0);
  });

  await test.step('sort resets pagination while preserving category and search', async () => {
    await openCatalogue(page, '/products?category=e2e-pagination-alpha&search=ORBIT&page=2', safety.requests);
    await expectDesktopPage(page, 2, ['13'], 13, { ...alpha, ...orbit });
    await expect(alphaButton).toHaveAttribute('aria-pressed', 'true');
    await expect(search).toHaveValue(orbit.search);
    await expect(sort).toHaveValue('featured');

    await sort.selectOption(ascending.sort);
    await expectDesktopPage(page, 1, filteredPriceFirst, 13, combined);
    await expectCombinedFilters(page);
  });
});

test('filtered page overflow redirects to the last matching page', async ({ page, safety }) => {
  await openCatalogue(page, `${combinedPath}&page=99`, safety.requests);
  const { previous } = catalogue(page);

  await expectDesktopPage(page, 2, ['01'], 13, combined);
  await expectCombinedFilters(page);
  await previous.click();
  await expectDesktopPage(page, 1, filteredPriceFirst, 13, combined);
  await expectCombinedFilters(page);
});

test('browser Back and Forward synchronize filtered catalogue pagination', async ({ page, safety }) => {
  await openCatalogue(page, combinedPath, safety.requests);
  const { next } = catalogue(page);

  await expectDesktopPage(page, 1, filteredPriceFirst, 13, combined);
  await expectCombinedFilters(page);
  await next.click();
  await expectDesktopPage(page, 2, ['01'], 13, combined);
  await expectCombinedFilters(page);

  await page.goBack();
  await expectDesktopPage(page, 1, filteredPriceFirst, 13, combined);
  await expectCombinedFilters(page);
  await page.goForward();
  await expectDesktopPage(page, 2, ['01'], 13, combined);
  await expectCombinedFilters(page);
});
