import type { ProductSortOption } from '../../../apps/web/types/product-catalog';
import { test, expect } from './catalogue-test';

type SortScenario = {
  value: ProductSortOption;
  order: readonly string[];
};

// Explicit golden identities, independent of the fixture's sorting implementation.
const scenarios = [
  { value: 'featured', order: ['Fir', 'Alder', 'Cedar', 'Birch', 'Dune', 'Elm'] },
  { value: 'newest', order: ['Birch', 'Dune', 'Fir', 'Alder', 'Elm', 'Cedar'] },
  { value: 'price-low-high', order: ['Birch', 'Dune', 'Alder', 'Fir', 'Elm', 'Cedar'] },
  { value: 'price-high-low', order: ['Cedar', 'Elm', 'Fir', 'Alder', 'Dune', 'Birch'] },
  { value: 'highest-rated', order: ['Cedar', 'Elm', 'Birch', 'Fir', 'Alder', 'Dune'] },
  { value: 'alphabetical', order: ['Alder', 'Birch', 'Cedar', 'Dune', 'Elm', 'Fir'] },
] as const satisfies readonly SortScenario[];

const featuredOrder = scenarios[0].order;
const alphabeticalOrder = scenarios[5].order;
const productNames = (names: readonly string[]) => names.map(name => `E2E Catalogue ${name}`);

for (const scenario of scenarios) {
  test(`catalogue sort ${scenario.value} updates the URL and displayed product order`, async ({ page, safety, catalogueSafety }) => {
    test.setTimeout(60_000);
    // Featured must be actively selected from a non-default state.
    const initialPath = scenario.value === 'featured' ? '/products?sort=alphabetical' : '/products';
    const initialSort = scenario.value === 'featured' ? 'alphabetical' : 'featured';
    const initialOrder = scenario.value === 'featured' ? alphabeticalOrder : featuredOrder;
    const response = await page.goto(initialPath);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(`http://127.0.0.1:3100${initialPath}`);

    const main = page.getByRole('main');
    const articles = main.getByRole('article');
    const headings = articles.getByRole('heading', { level: 3 });
    const sort = main.getByRole('combobox', { name: 'Sort by', exact: true });
    const resultCount = main.locator('#product-results').getByText('6 products found', { exact: true });

    await expect(sort).toHaveValue(initialSort);
    await expect(headings).toHaveText(productNames(initialOrder));
    await expect(articles).toHaveCount(6);
    await expect(resultCount).toBeVisible();
    await expect.poll(() => safety.requests.some(request => request.disposition === 'mock-auth')).toBe(true);
    await expect.poll(() => safety.requests.some(request => request.disposition === 'mock-cart')).toBe(true);

    await sort.selectOption(scenario.value);
    const expectedPath = scenario.value === 'featured' ? '/products' : `/products?sort=${scenario.value}`;
    await expect(page).toHaveURL(`http://127.0.0.1:3100${expectedPath}`);
    if (scenario.value === 'featured') {
      expect(new URL(page.url()).searchParams.has('sort')).toBe(false);
    }
    await expect(sort).toHaveValue(scenario.value);
    await expect(headings).toHaveText(productNames(scenario.order));
    await expect(articles).toHaveCount(6);
    await expect(resultCount).toBeVisible();
    expect(catalogueSafety.unexpected).toEqual([]);
  });
}
