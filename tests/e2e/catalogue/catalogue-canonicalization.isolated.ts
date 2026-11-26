import type { Page } from '@playwright/test';
import { test, expect } from './catalogue-test';

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

test('explicit defaults and unsupported query parameters are removed from the catalogue URL', async ({ page, safety }) => {
  await openCatalogue(page, '/products?page=1&sort=featured&pageSize=48&tracking=e2e', safety.requests);
  await expectDefaultCatalogue(page);
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
