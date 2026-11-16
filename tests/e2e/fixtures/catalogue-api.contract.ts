import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer, request } from 'node:http';
import type { ApiErrorResponse, CategoriesResponse } from '../../../apps/web/lib/api/types';
import type { ProductDetailsResponse, ProductListResponse } from '../../../apps/web/types/product';
import { catalogueCategories, catalogueProducts } from './catalogue-data';
import { DIAGNOSTIC_LIMIT, startCatalogueFixture, STOREFRONT_ORIGIN } from './catalogue-api';

let fixture: Awaited<ReturnType<typeof startCatalogueFixture>>;
before(async () => { fixture = await startCatalogueFixture(0); });
after(async () => { await fixture?.close(); });

async function listing(query = ''): Promise<ProductListResponse> {
  const response = await fetch(`${fixture.url}/api/v1/products${query}`);
  assert.equal(response.status, 200);
  return response.json();
}

function identities(body: ProductListResponse) {
  return body.products.map(product => product.name.replace('E2E Catalogue ', ''));
}

test('health identifies an owned read-only fixture on an ephemeral loopback port', async () => {
  assert.equal(new URL(fixture.url).hostname, '127.0.0.1');
  assert.notEqual(new URL(fixture.url).port, '0');
  const response = await fetch(`${fixture.url}/__fixture/health`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.fixture, 'hotlap-catalogue');
  assert.equal(body.readOnly, true);
  assert.match(body.runId, /^[0-9a-f-]{36}$/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('categories have the exact envelope, ordered fictional identities and truthful counts', async () => {
  const response = await fetch(`${fixture.url}/api/v1/categories`);
  assert.equal(response.status, 200);
  const body: CategoriesResponse = await response.json();
  assert.deepEqual(Object.keys(body).sort(), ['categories', 'totalItems']);
  assert.equal(body.totalItems, 2);
  assert.deepEqual(body.categories.map(category => category.slug), ['e2e-fixture-alpha', 'e2e-fixture-beta']);
  assert.deepEqual(body.categories.map(category => category.sortOrder), [1, 2]);
  for (const category of body.categories) {
    assert.deepEqual(Object.keys(category).sort(),
      ['description', 'id', 'name', 'productCount', 'slug', 'sortOrder']);
    assert.equal(category.productCount, 3);
    assert.equal(category.productCount, catalogueProducts.filter(product => product.category.id === category.id).length);
  }
});

test('listing serializes complete products, image contracts and default metadata', async () => {
  const body = await listing();
  assert.deepEqual(Object.keys(body).sort(), ['filters', 'pagination', 'products']);
  assert.deepEqual(body.pagination, {
    page: 1, pageSize: 12, totalItems: 6, totalPages: 1,
    hasPreviousPage: false, hasNextPage: false,
  });
  assert.deepEqual(body.filters, {
    search: null, category: null, brand: null, minimumPrice: null, maximumPrice: null,
    inStock: null, featured: null, sort: 'featured',
  });
  const keys = ['id', 'name', 'slug', 'sku', 'brand', 'shortDescription', 'description',
    'price', 'compareAtPrice', 'currency', 'stockQuantity', 'isInStock', 'lowStockThreshold',
    'isFeatured', 'ratingAverage', 'reviewCount', 'specifications', 'badges', 'category',
    'images', 'createdAt', 'updatedAt'].sort();
  for (const product of body.products) {
    assert.deepEqual(Object.keys(product).sort(), keys);
    assert.match(product.id, /^00000000-0000-4000-8000-\d{12}$/);
    assert.match(product.name, /^E2E Catalogue /);
    assert.match(product.description, /Fictional test-only/);
    assert.equal(product.currency, 'INR');
    assert.equal(product.compareAtPrice, null);
    assert.equal(product.isInStock, product.stockQuantity > 0);
    assert.ok(product.stockQuantity > product.lowStockThreshold);
    assert.deepEqual(product.specifications, {});
    assert.deepEqual(product.badges, []);
    assert.deepEqual(Object.keys(product.category).sort(), ['id', 'name', 'slug']);
    assert.equal(product.images.length, 1);
    assert.deepEqual(Object.keys(product.images[0]).sort(), ['alt', 'id', 'isPrimary', 'sortOrder', 'url']);
    assert.equal(product.images[0].url, '/products/product-placeholder.svg');
    assert.match(product.images[0].alt, /Fictional/);
    assert.equal(product.images[0].isPrimary, true);
    assert.equal(product.images[0].sortOrder, 0);
    assert.match(product.createdAt, /^2026-01-0[1-6]T00:00:00.000Z$/);
    assert.equal(product.updatedAt, '2026-02-01T00:00:00.000Z');
  }
  for (const key of ['id', 'slug', 'sku'] as const) {
    assert.equal(new Set(body.products.map(product => product[key])).size, 6);
  }
});

// Golden orders are independent of the fixture comparator implementation.
const orders = {
  featured: ['Fir', 'Alder', 'Cedar', 'Birch', 'Dune', 'Elm'],
  newest: ['Birch', 'Dune', 'Fir', 'Alder', 'Elm', 'Cedar'],
  'price-asc': ['Birch', 'Dune', 'Alder', 'Fir', 'Elm', 'Cedar'],
  'price-desc': ['Cedar', 'Elm', 'Fir', 'Alder', 'Dune', 'Birch'],
  rating: ['Cedar', 'Elm', 'Birch', 'Fir', 'Alder', 'Dune'],
  name: ['Alder', 'Birch', 'Cedar', 'Dune', 'Elm', 'Fir'],
};
for (const [sort, expected] of Object.entries(orders)) {
  test(`sort=${sort} returns independently specified ordering`, async () => {
    const body = await listing(`?sort=${sort}`);
    assert.deepEqual(identities(body), expected);
    assert.equal(body.filters.sort, sort);
  });
}

for (const [query, expected] of [
  ['category=e2e-fixture-alpha', ['Alder', 'Cedar', 'Elm']],
  ['category=e2e-fixture-beta', ['Fir', 'Birch', 'Dune']],
  ['search=ORBIT', ['Alder', 'Birch', 'Elm']],
  ['search=orbit&category=e2e-fixture-alpha', ['Alder', 'Elm']],
  ['search=orbit&category=e2e-fixture-beta', ['Birch']],
  ['search=alDER', ['Alder']],
  ['search=fictional%20test-only', ['Fir', 'Alder', 'Cedar', 'Birch', 'Dune', 'Elm']],
  ['search=%20orbit%20&sort=price-asc', ['Birch', 'Alder', 'Elm']],
  ['brand=e2e%20ORBIT%20brand', ['Birch']],
  ['minimumPrice=200&maximumPrice=400', ['Fir', 'Alder', 'Dune']],
  ['featured=true', ['Fir', 'Alder', 'Cedar']],
  ['featured=false', ['Birch', 'Dune', 'Elm']],
  ['inStock=true', ['Fir', 'Alder', 'Cedar', 'Birch', 'Dune', 'Elm']],
] as const) {
  test(`filters ${query} return matching identities and counts`, async () => {
    const body = await listing(`?${query}`);
    assert.deepEqual(identities(body), expected);
    assert.equal(body.pagination.totalItems, expected.length);
    assert.equal(body.pagination.totalPages, 1);
    assert.equal(body.pagination.hasNextPage, false);
  });
}

test('filters echo normalized contract values', async () => {
  const body = await listing('?search=%20orbit%20&category=%20e2e-fixture-alpha%20&brand=%20E2E%20Fixture%20Brand%20&minimumPrice=300&maximumPrice=500&inStock=true&featured=false&sort=name');
  assert.deepEqual(identities(body), ['Elm']);
  assert.deepEqual(body.filters, {
    search: 'orbit', category: 'e2e-fixture-alpha', brand: 'E2E Fixture Brand',
    minimumPrice: 300, maximumPrice: 500, inStock: true, featured: false, sort: 'name',
  });
});

for (const query of ['search=fixture-no-match', 'category=unknown', 'inStock=false']) {
  test(`empty results for ${query} preserve backend zero-page metadata`, async () => {
    const body = await listing(`?${query}`);
    assert.deepEqual(body.products, []);
    assert.deepEqual(body.pagination, {
      page: 1, pageSize: 12, totalItems: 0, totalPages: 0,
      hasPreviousPage: false, hasNextPage: false,
    });
  });
}

for (const [page, expected, previous, next] of [
  [1, ['Alder', 'Birch'], false, true],
  [2, ['Cedar', 'Dune'], true, true],
  [3, ['Elm', 'Fir'], true, false],
  [4, [], true, false],
] as const) {
  test(`pagination page ${page} slices sorted results without changing totals`, async () => {
    const body = await listing(`?sort=name&pageSize=2&page=${page}`);
    assert.deepEqual(identities(body), expected);
    assert.deepEqual(body.pagination, {
      page, pageSize: 2, totalItems: 6, totalPages: 3,
      hasPreviousPage: previous, hasNextPage: next,
    });
  });
}

test('pagination counts the filtered set before slicing', async () => {
  const body = await listing('?search=orbit&sort=name&pageSize=2&page=2');
  assert.deepEqual(identities(body), ['Elm']);
  assert.deepEqual(body.pagination, {
    page: 2, pageSize: 2, totalItems: 3, totalPages: 2,
    hasPreviousPage: true, hasNextPage: false,
  });
});

for (const query of ['sort=alphabetical', 'page=0', 'page=-1', 'page=2.5', 'page=x',
  'pageSize=0', 'pageSize=49', 'inStock=yes', 'featured=1', 'minimumPrice=-1',
  'minimumPrice=400&maximumPrice=300', `search=${'x'.repeat(121)}`,
  `category=${'x'.repeat(101)}`, 'page=1&page=2', 'search=a&search=b']) {
  test(`invalid query ${query.slice(0, 65)} returns validation error`, async () => {
    const response = await fetch(`${fixture.url}/api/v1/products?${query}`);
    assert.equal(response.status, 400);
    const body: ApiErrorResponse = await response.json();
    assert.equal(body.statusCode, 400);
    assert.equal(body.error, 'ApiError');
    assert.equal(body.code, 'INVALID_PRODUCT_QUERY');
    assert.equal(body.message, 'The product filters are invalid.');
    assert.ok(body.details && Object.keys(body.details).length > 0);
  });
}

test('product detail has the exact wrapper and missing slugs return the real error contract', async () => {
  const response = await fetch(`${fixture.url}/api/v1/products/e2e-catalogue-alder`);
  assert.equal(response.status, 200);
  const body: ProductDetailsResponse = await response.json();
  assert.deepEqual(Object.keys(body), ['product']);
  assert.equal(body.product.name, 'E2E Catalogue Alder');
  const missing = await fetch(`${fixture.url}/api/v1/products/missing`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), {
    statusCode: 404, error: 'ApiError', code: 'PRODUCT_NOT_FOUND',
    message: 'The requested product was not found.',
  });
});

test('detail lookup decodes and trims slugs while reserved endpoints stay unsupported', async () => {
  const response = await fetch(`${fixture.url}/api/v1/products/%20e2e%2Dcatalogue%2Dalder%20`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).product.slug, 'e2e-catalogue-alder');
  const empty = await fetch(`${fixture.url}/api/v1/products/%20`);
  assert.equal(empty.status, 400);
  assert.equal((await empty.json()).code, 'PRODUCT_SLUG_REQUIRED');
  assert.equal((await fetch(`${fixture.url}/api/v1/products/%66eatured`)).status, 404);
});

for (const path of ['/api/v1/products/featured', '/api/v1/products/a/extra', '/unknown',
  '/api/v1/auth/refresh', '/api/v1/cart', '/api/v1/wishlist', '/api/v1/orders', '/api/v1/account']) {
  test(`${path} is rejected locally as an unsupported endpoint`, async () => {
    const response = await fetch(`${fixture.url}${path}`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).code, 'FIXTURE_ROUTE_NOT_FOUND');
  });
}

for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']) {
  test(`${method} cannot change products`, async () => {
    const response = await fetch(`${fixture.url}/api/v1/products`, { method });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET');
    if (method !== 'HEAD') assert.equal((await response.json()).code, 'FIXTURE_METHOD_NOT_ALLOWED');
    assert.deepEqual(identities(await listing()), orders.featured);
  });
}

test('CORS permits only the isolated storefront and read-only preflight', async () => {
  const response = await fetch(`${fixture.url}/api/v1/products`, { headers: { origin: STOREFRONT_ORIGIN } });
  assert.equal(response.headers.get('access-control-allow-origin'), STOREFRONT_ORIGIN);
  assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
  const options = await fetch(`${fixture.url}/api/v1/products`, {
    method: 'OPTIONS', headers: { origin: STOREFRONT_ORIGIN, 'access-control-request-method': 'GET' },
  });
  assert.equal(options.status, 204);
  assert.equal(options.headers.get('access-control-allow-methods'), 'GET');
  for (const headers of [
    { origin: 'http://localhost:3000' },
    { origin: 'https://example.invalid' },
  ]) {
    const denied = await fetch(`${fixture.url}/api/v1/products`, { headers });
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
  }
  const deniedPreflights: Record<string, string>[] = [
    { origin: STOREFRONT_ORIGIN, 'access-control-request-method': 'POST' },
    { origin: STOREFRONT_ORIGIN, 'access-control-request-method': 'GET', 'access-control-request-headers': 'authorization' },
  ];
  for (const headers of deniedPreflights) {
    assert.equal((await fetch(`${fixture.url}/api/v1/products`, { method: 'OPTIONS', headers })).status, 405);
  }
});

test('diagnostics are bounded, sequenced and redact credentials, bodies, unknown paths and query text', async t => {
  const own = await startCatalogueFixture(0);
  t.after(() => own.close());
  for (let i = 0; i < DIAGNOSTIC_LIMIT + 3; i++) await fetch(`${own.url}/__fixture/health`);
  await fetch(`${own.url}/api/v1/products?search=private-secret&category=private-secret&brand=private-secret&sort=private-secret&unknown=private-secret`);
  const credentials = await fetch(`${own.url}/api/v1/products/private-secret`, {
    headers: { authorization: 'Bearer credential-secret', cookie: 'customer=cookie-secret' },
  });
  assert.equal(credentials.status, 400);
  assert.equal((await credentials.json()).code, 'FIXTURE_CREDENTIALS_FORBIDDEN');
  await fetch(`${own.url}/private-secret`, { method: 'POST', body: 'body-secret' });
  const response = await fetch(`${own.url}/__fixture/requests`);
  const body = await response.json();
  assert.equal(body.limit, DIAGNOSTIC_LIMIT);
  assert.equal(body.requests.length, DIAGNOSTIC_LIMIT);
  assert.ok(body.requests[0].sequence > 1);
  const serialized = JSON.stringify(body);
  for (const secret of ['private-secret', 'credential-secret', 'cookie-secret', 'body-secret']) {
    assert.equal(serialized.includes(secret), false);
  }
  assert.match(serialized, /\[redacted\]/);
  assert.match(serialized, /<unknown>/);
  assert.match(serialized, /<unsupported>/);
  for (const record of body.requests) {
    assert.deepEqual(Object.keys(record).sort(), ['method', 'path', 'query', 'sequence', 'status']);
  }
});

test('unknown and write requests never invoke outbound fetch or reach a canary API', async t => {
  let canaryRequests = 0;
  const canary = createServer((_request, response) => { canaryRequests++; response.end('{}'); });
  await new Promise<void>(resolve => canary.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise<void>((resolve, reject) => {
    canary.close(error => error ? reject(error) : resolve());
    canary.closeAllConnections();
  }));
  const address = canary.address();
  assert.ok(address && typeof address !== 'string');
  const previous = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = `http://127.0.0.1:${address.port}/api/v1`;
  t.after(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = previous;
  });
  const originalFetch = globalThis.fetch;
  let outbound = 0;
  globalThis.fetch = async () => { outbound++; throw new Error('Outbound fetch forbidden'); };
  t.after(() => { globalThis.fetch = originalFetch; });
  // Use Node HTTP for probes so the server's fetch guard cannot hide forwarding.
  for (const [path, method, expected] of [
    ['/api/v1/cart', 'GET', 404],
    ['/api/v1/products/featured', 'GET', 404],
    ['/api/v1/products/missing', 'GET', 404],
    ['/api/v1/products', 'GET', 200],
    ['/api/v1/products', 'POST', 405],
    ['/api/v1/cart', 'POST', 404],
  ] as const) {
    const status = await new Promise<number | undefined>((resolve, reject) => {
      const probe = request(`${fixture.url}${path}`, { method }, response => {
        response.resume();
        response.on('end', () => resolve(response.statusCode));
      });
      probe.on('error', reject);
      probe.end();
    });
    assert.equal(status, expected);
  }
  assert.equal(outbound, 0);
  assert.equal(canaryRequests, 0);
});

test('malformed absolute request targets return an error without crashing the listener', async () => {
  const address = new URL(fixture.url);
  const status = await new Promise<number | undefined>((resolve, reject) => {
    const probe = request({ hostname: address.hostname, port: address.port, path: 'http://[' }, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    probe.on('error', reject);
    probe.end();
  });
  assert.equal(status, 400);
  assert.equal((await fetch(`${fixture.url}/__fixture/health`)).status, 200);
});

test('dataset is deeply frozen and returned JSON cannot alter subsequent responses', async () => {
  assert.ok(Object.isFrozen(catalogueProducts));
  assert.ok(Object.isFrozen(catalogueProducts[0].images[0]));
  assert.ok(Object.isFrozen(catalogueCategories.categories[0]));
  const body = await listing();
  body.products[0].price = -100;
  assert.equal((await listing()).products[0].price, 400);
});

test('closing a fixture releases only its own listener; occupied ports are not replaced', async t => {
  const own = await startCatalogueFixture(0);
  t.after(() => own.close());
  const port = Number(new URL(own.url).port);
  await assert.rejects(startCatalogueFixture(port), { code: 'EADDRINUSE' });
  assert.equal((await fetch(`${own.url}/__fixture/health`)).status, 200);
  const disposable = await startCatalogueFixture(0);
  await disposable.close();
  await assert.rejects(fetch(`${disposable.url}/__fixture/health`));
});
