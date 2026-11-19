import { test, expect } from './catalogue-test';

type CategoryScenario = {
  name: string;
  slug: string;
  otherName: string;
  products: readonly string[];
};

const defaultOrder = [
  'E2E Catalogue Fir',
  'E2E Catalogue Alder',
  'E2E Catalogue Cedar',
  'E2E Catalogue Birch',
  'E2E Catalogue Dune',
  'E2E Catalogue Elm',
];

const scenarios = [
  {
    name: 'E2E Fixture Alpha',
    slug: 'e2e-fixture-alpha',
    otherName: 'E2E Fixture Beta',
    products: ['E2E Catalogue Alder', 'E2E Catalogue Cedar', 'E2E Catalogue Elm'],
  },
  {
    name: 'E2E Fixture Beta',
    slug: 'e2e-fixture-beta',
    otherName: 'E2E Fixture Alpha',
    products: ['E2E Catalogue Fir', 'E2E Catalogue Birch', 'E2E Catalogue Dune'],
  },
] as const satisfies readonly CategoryScenario[];

for (const scenario of scenarios) {
  test(`${scenario.name} filters products and All Items restores the catalogue`, async ({ page, safety, catalogueSafety }) => {
    const response = await page.goto('/products');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('http://127.0.0.1:3100/products');

    const main = page.getByRole('main');
    const articles = main.getByRole('article');
    const productHeadings = articles.getByRole('heading', { level: 3 });
    const results = main.locator('#product-results');
    const allItems = main.getByRole('button', { name: 'All Items', exact: true });
    const category = main.getByRole('button', { name: `${scenario.name} (3)`, exact: true });
    const otherCategory = main.getByRole('button', { name: `${scenario.otherName} (3)`, exact: true });

    await expect(articles).toHaveCount(6);
    await expect(productHeadings).toHaveText(defaultOrder);
    await expect(results.getByText('6 products found', { exact: true })).toBeVisible();
    await expect(category).toBeVisible();
    await expect(otherCategory).toBeVisible();
    await expect(allItems).toHaveAttribute('aria-pressed', 'true');
    await expect(category).toHaveAttribute('aria-pressed', 'false');
    await expect(otherCategory).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => safety.requests.some(request => request.disposition === 'mock-auth')).toBe(true);
    await expect.poll(() => safety.requests.some(request => request.disposition === 'mock-cart')).toBe(true);

    await category.click();
    await expect(page).toHaveURL(`http://127.0.0.1:3100/products?category=${scenario.slug}`);
    expect(new URL(page.url()).searchParams.get('category')).toBe(scenario.slug);
    await expect(productHeadings).toHaveText([...scenario.products]);
    await expect(articles).toHaveCount(3);
    await expect(category).toHaveAttribute('aria-pressed', 'true');
    await expect(otherCategory).toHaveAttribute('aria-pressed', 'false');
    await expect(allItems).toHaveAttribute('aria-pressed', 'false');
    await expect(main.getByRole('heading', { name: scenario.name, exact: true })).toBeVisible();
    await expect(results.getByText('3 products found', { exact: true })).toBeVisible();

    await allItems.click();
    await expect(page).toHaveURL('http://127.0.0.1:3100/products');
    expect(new URL(page.url()).searchParams.has('category')).toBe(false);
    await expect(productHeadings).toHaveText(defaultOrder);
    await expect(articles).toHaveCount(6);
    await expect(allItems).toHaveAttribute('aria-pressed', 'true');
    await expect(category).toHaveAttribute('aria-pressed', 'false');
    await expect(otherCategory).toHaveAttribute('aria-pressed', 'false');
    await expect(results.getByText('6 products found', { exact: true })).toBeVisible();
    expect(catalogueSafety.unexpected).toEqual([]);
  });
}
