import { expect, test } from '@playwright/test';

import {
  buildProductCatalogueUrl,
  parseProductCatalogueQuery,
  productCatalogueQueryIsCanonical,
  type ProductSearchParams,
} from '../../apps/web/lib/product-catalog-query';
import {
  DEFAULT_PRODUCT_PAGE,
  DEFAULT_PRODUCT_SORT,
  isProductSortOption,
  mapProductSortToApi,
  sortOptions,
  type ProductCatalogueQuery,
  type ProductSortOption,
} from '../../apps/web/types/product-catalog';
import {
  productSortValues,
  type ProductSort,
} from '../../services/api/src/products/product-query-schema';

// Pure contracts only: no page/context/request fixtures, application loading,
// signed-out fixture, database data, or assertions about browser navigation.
test('missing parameters use featured/page one and the bare canonical URL', () => {
  const query = parseProductCatalogueQuery({});
  expect(DEFAULT_PRODUCT_SORT).toBe('featured');
  expect(DEFAULT_PRODUCT_PAGE).toBe(1);
  expect(query).toEqual({ search: undefined, category: undefined, sort: 'featured', page: 1 });
  expect(productCatalogueQueryIsCanonical({}, query)).toBe(true);
  expect(buildProductCatalogueUrl(query)).toBe('/products');
  expect(buildProductCatalogueUrl({})).toBe('/products');
});

test('explicit default parameters normalize to an URL without sort or page', () => {
  const raw: ProductSearchParams = { sort: 'featured', page: '1' };
  const query = parseProductCatalogueQuery(raw);
  expect(query.sort).toBe('featured');
  expect(query.page).toBe(1);
  expect(productCatalogueQueryIsCanonical(raw, query)).toBe(false);
  expect(buildProductCatalogueUrl(query)).toBe('/products');
});

for (const { key, limit } of [{ key: 'search', limit: 120 }, { key: 'category', limit: 100 }] as const) {
  test.describe(`${key} text contract`, () => {
    const cases: Array<{
      name: string;
      raw: ProductSearchParams[string];
      expected: string | undefined;
      canonical: boolean;
    }> = [
      { name: 'trims surrounding whitespace', raw: '  RC parts  ', expected: 'RC parts', canonical: false },
      { name: 'removes an empty value', raw: '', expected: undefined, canonical: false },
      { name: 'removes whitespace-only input', raw: ' \t\n ', expected: undefined, canonical: false },
      { name: `preserves exactly ${limit} characters`, raw: 'x'.repeat(limit), expected: 'x'.repeat(limit), canonical: true },
      { name: `trims before truncating to ${limit} characters`, raw: `  ${'x'.repeat(limit)}tail  `, expected: 'x'.repeat(limit), canonical: false },
      { name: 'uses the first duplicate and rejects the array as canonical', raw: ['first', 'second'], expected: 'first', canonical: false },
      { name: 'does not fall through an empty first duplicate', raw: ['', 'second'], expected: undefined, canonical: false },
      { name: 'normalizes an empty value array to absence', raw: [], expected: undefined, canonical: false },
    ];
    for (const entry of cases) {
      test(entry.name, () => {
        const raw: ProductSearchParams = { [key]: entry.raw };
        const query = parseProductCatalogueQuery(raw);
        expect(query[key]).toBe(entry.expected);
        expect(productCatalogueQueryIsCanonical(raw, query)).toBe(entry.canonical);
        const url = new URL(buildProductCatalogueUrl(query), 'https://query-contract.invalid');
        expect(url.searchParams.get(key)).toBe(entry.expected ?? null);
        const normalized: ProductSearchParams = Object.fromEntries(url.searchParams);
        expect(productCatalogueQueryIsCanonical(normalized, parseProductCatalogueQuery(normalized))).toBe(true);
      });
    }
  });
}

const sortCases = [
  { storefront: 'featured', api: 'featured' },
  { storefront: 'newest', api: 'newest' },
  { storefront: 'price-low-high', api: 'price-asc' },
  { storefront: 'price-high-low', api: 'price-desc' },
  { storefront: 'highest-rated', api: 'rating' },
  { storefront: 'alphabetical', api: 'name' },
] satisfies Array<{ storefront: ProductSortOption; api: ProductSort }>;

test('the six selectable storefront sorts and backend values match the covered contract', () => {
  expect(sortOptions.map(option => option.value)).toEqual(sortCases.map(entry => entry.storefront));
  expect(new Set(productSortValues)).toEqual(new Set(sortCases.map(entry => entry.api)));
});

for (const { storefront, api } of sortCases) {
  test(`sort ${storefront} parses and maps to API ${api}`, () => {
    const raw: ProductSearchParams = { sort: storefront };
    const query = parseProductCatalogueQuery(raw);
    expect(isProductSortOption(storefront)).toBe(true);
    expect(query.sort).toBe(storefront);
    expect(mapProductSortToApi(storefront)).toBe(api);
    expect(productCatalogueQueryIsCanonical(raw, query)).toBe(storefront !== 'featured');
    expect(buildProductCatalogueUrl(query)).toBe(storefront === 'featured' ? '/products' : `/products?sort=${storefront}`);
  });
}

for (const invalid of ['unknown', 'price-asc', 'price-desc', 'rating', 'name', 'NEWEST', '']) {
  test(`unrecognized storefront sort ${JSON.stringify(invalid)} normalizes to featured`, () => {
    const raw: ProductSearchParams = { sort: invalid };
    const query = parseProductCatalogueQuery(raw);
    expect(isProductSortOption(invalid)).toBe(false);
    expect(query.sort).toBe('featured');
    expect(productCatalogueQueryIsCanonical(raw, query)).toBe(false);
    expect(buildProductCatalogueUrl(query)).toBe('/products');
  });
}

test('sort parsing trims a supported value while the type guard requires an exact value', () => {
  const raw: ProductSearchParams = { sort: '  newest  ' };
  const query = parseProductCatalogueQuery(raw);
  expect(isProductSortOption(raw.sort as string)).toBe(false);
  expect(query.sort).toBe('newest');
  expect(productCatalogueQueryIsCanonical(raw, query)).toBe(false);
  expect(buildProductCatalogueUrl(query)).toBe('/products?sort=newest');
});

test('duplicate sorts use only the first value, including when it is invalid', () => {
  expect(parseProductCatalogueQuery({ sort: ['newest', 'featured'] }).sort).toBe('newest');
  expect(parseProductCatalogueQuery({ sort: ['unknown', 'newest'] }).sort).toBe('featured');
  expect(parseProductCatalogueQuery({ sort: [] }).sort).toBe('featured');
  const raw: ProductSearchParams = { sort: ['newest'] };
  expect(productCatalogueQueryIsCanonical(raw, parseProductCatalogueQuery(raw))).toBe(false);
});

const pageCases: Array<{
  name: string;
  raw: ProductSearchParams[string];
  expected: number;
  canonical: boolean;
}> = [
  { name: 'missing', raw: undefined, expected: 1, canonical: true },
  { name: 'explicit first page', raw: '1', expected: 1, canonical: false },
  { name: 'ordinary second page', raw: '2', expected: 2, canonical: true },
  { name: 'zero', raw: '0', expected: 1, canonical: false },
  { name: 'negative', raw: '-3', expected: 1, canonical: false },
  { name: 'nonnumeric', raw: 'not-a-page', expected: 1, canonical: false },
  { name: 'empty', raw: '', expected: 1, canonical: false },
  { name: 'whitespace only', raw: '  ', expected: 1, canonical: false },
  // Preserve the existing base-10 parseInt contract; these are not strict numeric validation.
  { name: 'decimal integer prefix', raw: '2.5', expected: 2, canonical: false },
  { name: 'text following an integer prefix', raw: '2abc', expected: 2, canonical: false },
  { name: 'exponent notation is not evaluated', raw: '1e3', expected: 1, canonical: false },
  { name: 'hex notation is not evaluated', raw: '0x10', expected: 1, canonical: false },
  { name: 'leading zeroes', raw: '0002', expected: 2, canonical: false },
  { name: 'trimmed positive sign', raw: ' +2 ', expected: 2, canonical: false },
  { name: 'surrounding whitespace', raw: ' 2 ', expected: 2, canonical: false },
  { name: 'large page evaluated only as a pure function', raw: '1000000', expected: 1000000, canonical: true },
  { name: 'maximum safe integer', raw: String(Number.MAX_SAFE_INTEGER), expected: Number.MAX_SAFE_INTEGER, canonical: true },
  { name: 'unsafe integer', raw: String(Number.MAX_SAFE_INTEGER + 1), expected: 1, canonical: false },
  { name: 'oversized numeric text', raw: '9'.repeat(30), expected: 1, canonical: false },
  { name: 'duplicate pages', raw: ['2', '3'], expected: 2, canonical: false },
  { name: 'invalid first duplicate', raw: ['bad', '2'], expected: 1, canonical: false },
  { name: 'empty array', raw: [], expected: 1, canonical: false },
];

for (const entry of pageCases) {
  test(`page parsing: ${entry.name}`, () => {
    const raw: ProductSearchParams = { page: entry.raw };
    const query = parseProductCatalogueQuery(raw);
    expect(query.page).toBe(entry.expected);
    expect(productCatalogueQueryIsCanonical(raw, query)).toBe(entry.canonical);
    expect(buildProductCatalogueUrl(query)).toBe(entry.expected === 1 ? '/products' : `/products?page=${entry.expected}`);
  });
}

test('search and category round-trip spaces, literal plus, reserved characters and Unicode', () => {
  // Syntax samples only: no category-existence or product-content assumptions.
  const raw: ProductSearchParams = { search: 'RC + 50% & /?# β', category: 'cars & tools/β' };
  const query = parseProductCatalogueQuery(raw);
  const url = buildProductCatalogueUrl(query);
  expect(url).toBe('/products?search=RC+%2B+50%25+%26+%2F%3F%23+%CE%B2&category=cars+%26+tools%2F%CE%B2');
  const decoded: ProductSearchParams = Object.fromEntries(new URL(url, 'https://query-contract.invalid').searchParams);
  expect(decoded).toEqual(raw);
  expect(parseProductCatalogueQuery(decoded)).toEqual(query);
  expect(productCatalogueQueryIsCanonical(decoded, query)).toBe(true);
});

for (const extra of ['brand', 'inStock', 'pageSize', 'tracking']) {
  test(`unsupported storefront parameter ${extra} is removed without losing supported values`, () => {
    const raw: ProductSearchParams = { search: 'RC', category: 'parts', sort: 'newest', page: '3', [extra]: 'ignored' };
    const query = parseProductCatalogueQuery(raw);
    expect(query).toEqual({ search: 'RC', category: 'parts', sort: 'newest', page: 3 });
    expect(productCatalogueQueryIsCanonical(raw, query)).toBe(false);
    expect(buildProductCatalogueUrl(query)).toBe('/products?search=RC&category=parts&sort=newest&page=3');
  });
}

test('all duplicate parameters collapse to their normalized first values', () => {
  const raw: ProductSearchParams = {
    search: [' RC ', 'other'], category: [' parts ', 'other'], sort: ['newest', 'featured'], page: ['2', '3'],
  };
  const query = parseProductCatalogueQuery(raw);
  expect(query).toEqual({ search: 'RC', category: 'parts', sort: 'newest', page: 2 });
  expect(productCatalogueQueryIsCanonical(raw, query)).toBe(false);
  expect(buildProductCatalogueUrl(query)).toBe('/products?search=RC&category=parts&sort=newest&page=2');
});

test('canonical comparison checks supported values rather than object key order', () => {
  const raw: ProductSearchParams = { page: '3', sort: 'newest', category: 'parts', search: 'RC' };
  const query = parseProductCatalogueQuery(raw);
  expect(productCatalogueQueryIsCanonical(raw, query)).toBe(true);
  expect(productCatalogueQueryIsCanonical(raw, { ...query, search: 'different' })).toBe(false);
  expect(productCatalogueQueryIsCanonical(raw, { ...query, sort: 'alphabetical' })).toBe(false);
  expect(productCatalogueQueryIsCanonical(raw, { ...query, page: 2 })).toBe(false);
});

test('builder preserves supplied supported fields and only resets pagination when the caller requests it', () => {
  const original: ProductCatalogueQuery = { search: 'RC', category: 'parts', sort: 'newest', page: 4 };
  expect(buildProductCatalogueUrl(original)).toBe('/products?search=RC&category=parts&sort=newest&page=4');
  expect(buildProductCatalogueUrl({ ...original, sort: 'price-low-high' })).toBe('/products?search=RC&category=parts&sort=price-low-high&page=4');
  expect(buildProductCatalogueUrl({ ...original, sort: 'price-low-high', page: 1 })).toBe('/products?search=RC&category=parts&sort=price-low-high');
  expect(buildProductCatalogueUrl({ ...original, search: 'battery', page: undefined })).toBe('/products?search=battery&category=parts&sort=newest');
  expect(buildProductCatalogueUrl({ ...original, search: undefined, page: 1 })).toBe('/products?category=parts&sort=newest');
  expect(buildProductCatalogueUrl({ ...original, category: undefined, page: 1 })).toBe('/products?search=RC&sort=newest');
  expect(buildProductCatalogueUrl({ ...original, sort: 'featured', page: 1 })).toBe('/products?search=RC&category=parts');
  expect(original).toEqual({ search: 'RC', category: 'parts', sort: 'newest', page: 4 });
});

test('builder trims blank optional text but does not enforce parser length limits', () => {
  expect(buildProductCatalogueUrl({ search: '  RC  ', category: '   ', sort: 'featured', page: 1 })).toBe('/products?search=RC');
  const query: ProductCatalogueQuery = { search: 'x'.repeat(121), category: 'y'.repeat(101) };
  const url = new URL(buildProductCatalogueUrl(query), 'https://query-contract.invalid');
  expect(url.searchParams.get('search')).toBe(query.search);
  expect(url.searchParams.get('category')).toBe(query.category);
  const raw: ProductSearchParams = Object.fromEntries(url.searchParams);
  expect(productCatalogueQueryIsCanonical(raw, parseProductCatalogueQuery(raw))).toBe(false);
});
