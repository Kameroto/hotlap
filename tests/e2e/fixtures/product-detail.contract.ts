import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getMaximumProductAddition, parseProductQuantity } from '../../../apps/web/lib/product-purchase-state';
import { startCatalogueFixture } from './catalogue-api';
import { catalogueProducts } from './catalogue-data';
import { detailProducts } from './catalogue-detail-data';
import { createDetailCart, identifyDetailMockRequest, isDetailProductRead, isExpectedDetailDocumentError } from './detail-cart-mock';

const detailId = '00000000-0000-4000-8000-000000000701';
const additionUrl = 'http://127.0.0.1:4100/api/v1/cart/items';
const headers = { 'content-type': 'application/json', origin: 'http://127.0.0.1:3100' };

test('isolated detail endpoint returns the full ordered product and protects profile boundaries', async t => {
  const detail = await startCatalogueFixture(0, { profile: 'product-detail' });
  t.after(() => detail.close());
  const defaultFixture = await startCatalogueFixture(0);
  t.after(() => defaultFixture.close());
  const response = await fetch(`${detail.url}/api/v1/products/e2e-detail-discount`);
  assert.equal(response.status, 200);
  const { product } = await response.json();
  assert.equal(product.id, detailId);
  assert.equal(product.sku, 'E2E-DETAIL-1');
  assert.equal(product.price, 300);
  assert.equal(product.compareAtPrice, 450);
  assert.equal(product.stockQuantity, 120);
  assert.deepEqual(product.specifications, { motorType: 'Synthetic brushless', scale: '1:14' });
  assert.deepEqual(product.images.map((image: { alt: string }) => image.alt),
    ['Fictional primary angle', 'Fictional side angle', 'Fictional rear angle']);
  const status = async (url: string, slug: string) => (await fetch(`${url}/api/v1/products/${slug}`)).status;
  assert.equal(await status(defaultFixture.url, product.slug), 404);
  assert.equal(await status(detail.url, catalogueProducts[0].slug), 404);
  assert.equal(await status(detail.url, 'e2e-detail-missing'), 404);
  assert.equal(await status(detail.url, 'e2e-detail-upstream-error'), 503);
  assert.equal(await status(defaultFixture.url, 'e2e-detail-upstream-error'), 404);
  assert.equal((await fetch(`${detail.url}/api/v1/products/e2e-detail-discount`, { method: 'POST' })).status, 405);
});

test('synthetic products provide distinct identities, stock states and local assets', () => {
  assert.equal(detailProducts.length, 5);
  for (const key of ['id', 'slug', 'sku'] as const) {
    assert.equal(new Set(detailProducts.map(product => product[key])).size, 5);
    assert.ok(detailProducts.every(product => catalogueProducts.every(base => base[key] !== product[key])));
  }
  assert.deepEqual(detailProducts.map(product => [product.stockQuantity, product.images.length]),
    [[120, 3], [3, 1], [0, 0], [8, 1], [6, 1]]);
  assert.ok(detailProducts.flatMap(product => product.images).every(image => image.url.startsWith('/products/')));
});

test('quantity uses remaining stock and the per-addition cap independently', () => {
  assert.equal(getMaximumProductAddition(120, 0), 99);
  assert.equal(getMaximumProductAddition(120, 118), 2);
  assert.equal(getMaximumProductAddition(120, 120), 0);
  assert.equal(getMaximumProductAddition(0, 2), 0);
  assert.equal(parseProductQuantity('2', 2), 2);
  for (const input of ['', '0', '-1', '1.5', '1e1', ' 1', '3', '999999999999999999999999']) {
    assert.equal(parseProductQuantity(input, 2), null, input);
  }
});

test('routing accepts only the exact synthetic cart endpoint and rejects unexpected credentials', () => {
  assert.equal(identifyDetailMockRequest(additionUrl, 'POST', headers, {}), 'add');
  for (const url of [
    additionUrl.replace(':4100', ':4000'), additionUrl.replace('127.0.0.1', 'localhost'),
    additionUrl.replace('/items', '/items/'), `${additionUrl}?mode=add`, `${additionUrl}#x`,
    additionUrl.replace('//', '//user:password@'),
  ]) assert.equal(identifyDetailMockRequest(url, 'POST', headers, {}), undefined);
  for (const method of ['GET', 'PATCH', 'OPTIONS', 'DELETE']) {
    assert.equal(identifyDetailMockRequest(additionUrl, method, headers, {}), undefined);
  }
  const rejectedHeaders: Record<string, string>[] = [
    { authorization: 'Bearer unexpected' }, { cookie: 'session=unknown' },
    { 'proxy-authorization': 'unexpected' }, { 'x-cart-token': 'unexpected' },
    { origin: 'http://localhost:3000' }, { 'content-type': 'text/plain' },
  ];
  for (const extra of rejectedHeaders) assert.equal(identifyDetailMockRequest(additionUrl, 'POST', { ...headers, ...extra }, {}), undefined);
});

test('guest and authenticated carts have separate state and require the synthetic session', () => {
  const guest = createDetailCart();
  const signedIn = createDetailCart({ authenticated: true, initialQuantity: 118 });
  const auth = signedIn.auth();
  assert.equal(auth.status, 200);
  assert.ok('accessToken' in auth.body);
  assert.equal(identifyDetailMockRequest(additionUrl, 'POST', headers, { authenticated: true }), undefined);
  assert.equal(identifyDetailMockRequest(additionUrl, 'POST',
    { ...headers, authorization: `Bearer ${auth.body.accessToken}` }, { authenticated: true }), 'add');
  assert.equal(guest.auth().status, 401);
  assert.equal(guest.snapshot().totalQuantity, 0);
  assert.equal(signedIn.snapshot().totalQuantity, 118);
  assert.equal(signedIn.add({ productId: detailId, quantity: 2 }).status, 201);
  assert.equal(signedIn.snapshot().totalQuantity, 120);
  assert.equal(guest.snapshot().totalQuantity, 0);
});

test('invalid quantities, unknown products and stock/API rejections never mutate the cart', () => {
  const cart = createDetailCart({ initialQuantity: 118 });
  const before = cart.snapshot();
  for (const quantity of [0, -1, 1.5, 100, '2', null, undefined]) {
    assert.equal(cart.add({ productId: detailId, quantity }).status, 400);
  }
  assert.equal(cart.add({ productId: catalogueProducts[0].id, quantity: 1 }).status, 404);
  assert.equal(cart.add({ productId: detailId, quantity: 3 }).status, 409);
  assert.equal(cart.add({ productId: '00000000-0000-4000-8000-000000000703', quantity: 1 }).status, 409);
  assert.deepEqual(cart.snapshot(), before);
  const rejected = createDetailCart({ rejectAddition: true });
  assert.equal(rejected.add({ productId: detailId, quantity: 1 }).status, 409);
  assert.equal(rejected.snapshot().totalQuantity, 0);
});

test('recently viewed reads permit only known synthetic products on the isolated fixture', () => {
  const allowed = new URL('http://127.0.0.1:4100/api/v1/products/e2e-detail-single');
  assert.equal(isDetailProductRead(allowed, 'GET'), true);
  assert.equal(isDetailProductRead(allowed, 'POST'), false);
  for (const variant of [
    allowed.href.replace(':4100', ':4000'),
    allowed.href.replace('e2e-detail-single', 'e2e-detail-upstream-error'),
    allowed.href.replace('e2e-detail-single', 'e2e-catalogue-alder'),
    allowed.href + '?other=true',
  ]) assert.equal(isDetailProductRead(new URL(variant), 'GET'), false);
});

test('controlled document errors require the exact scenario, origin, route, frame and status', () => {
  const missing = {
    url: 'http://127.0.0.1:3100/products/e2e-detail-missing',
    status: 404, method: 'GET', resourceType: 'document', mainFrame: true,
  };
  assert.equal(isExpectedDetailDocumentError('missing', missing), true);
  assert.equal(isExpectedDetailDocumentError('upstream', missing), false);
  for (const mismatch of [
    { status: 500 }, { mainFrame: false }, { method: 'POST' }, { resourceType: 'fetch' },
    { url: missing.url.replace(':3100', ':3000') }, { url: missing.url + '?other=true' },
  ]) assert.equal(isExpectedDetailDocumentError('missing', { ...missing, ...mismatch }), false);
});
