import type { AuthenticationResponse, ServerCart } from '../../../apps/web/lib/api/types';
import { addCartItemBodySchema } from '../../../services/api/src/cart/cart-schemas';
import { detailProducts, missingDetailSlug, unavailableDetailSlug } from './catalogue-detail-data';

export const detailApiOrigin = 'http://127.0.0.1:4100';
export const detailStorefrontOrigin = 'http://127.0.0.1:3100';
const accessToken = 'hotlap-isolated-synthetic-detail-session';

export type DetailCartOptions = {
  authenticated?: boolean;
  initialQuantity?: number;
  rejectAddition?: boolean;
  holdAddition?: boolean;
  scenario?: 'missing' | 'upstream';
};

export function isDetailProductRead(url: URL, method: string) {
  return method === 'GET' && url.origin === detailApiOrigin && !url.search && !url.hash &&
    !url.username && !url.password &&
    detailProducts.some(product => url.pathname === `/api/v1/products/${product.slug}`);
}

export function isExpectedDetailDocumentError(
  scenario: NonNullable<DetailCartOptions['scenario']>,
  response: { url: string; method: string; resourceType: string; mainFrame: boolean; status: number },
) {
  const slug = scenario === 'missing' ? missingDetailSlug : unavailableDetailSlug;
  return response.mainFrame && response.method === 'GET' && response.resourceType === 'document' &&
    response.url === `${detailStorefrontOrigin}/products/${slug}` &&
    response.status === (scenario === 'missing' ? 404 : 500);
}

export function identifyDetailMockRequest(
  rawUrl: string, method: string, headers: Record<string, string>, options: DetailCartOptions,
) {
  const url = new URL(rawUrl);
  if (url.origin !== detailApiOrigin || url.search || url.hash || url.username || url.password ||
      headers.cookie || headers['proxy-authorization'] || headers['x-cart-token'] ||
      (headers.origin !== undefined && headers.origin !== detailStorefrontOrigin)) return;
  if (method === 'POST' && url.pathname === '/api/v1/auth/refresh' && !headers.authorization) return 'auth';
  if (headers.authorization !== (options.authenticated ? `Bearer ${accessToken}` : undefined)) return;
  if (method === 'GET' && url.pathname === '/api/v1/cart') return 'cart';
  if (method === 'GET' && url.pathname === '/api/v1/wishlist' && options.authenticated) return 'wishlist';
  if (method === 'POST' && url.pathname === '/api/v1/cart/items' &&
      headers['content-type']?.split(';')[0] === 'application/json') return 'add';
}

const signedIn = {
  accessToken,
  user: {
    id: '00000000-0000-4000-8000-000000000777',
    email: 'detail-fixture@example.invalid',
    firstName: 'Detail',
    lastName: 'Fixture',
    phone: null,
    role: 'CUSTOMER',
    emailVerifiedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
} satisfies AuthenticationResponse;

function rejection(status: number, code: string, message: string) {
  return { status, body: { error: 'ApiError', statusCode: status, code, message } };
}

export function createDetailCart(options: DetailCartOptions = {}) {
  const quantities = new Map<string, number>();
  if (options.initialQuantity) quantities.set(detailProducts[0].id, options.initialQuantity);

  function snapshot(): ServerCart {
    const items = detailProducts.flatMap(product => {
      const quantity = quantities.get(product.id);
      return quantity ? [{ id: product.id, product, quantity, lineTotal: quantity * product.price,
        isPurchasable: quantity <= product.stockQuantity }] : [];
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return {
      id: '00000000-0000-4000-8000-000000000778', items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal, discountAmount: 0, totalBeforeShipping: subtotal, coupon: null,
      updatedAt: '2026-02-01T00:00:00.000Z',
    };
  }

  function add(body: unknown) {
    const parsed = addCartItemBodySchema.safeParse(body);
    if (!parsed.success || typeof body !== 'object' || body === null ||
        Object.keys(body).length !== 2 || !('quantity' in body) || typeof body.quantity !== 'number') {
      return rejection(400, 'INVALID_CART_ITEM', 'Invalid synthetic cart quantity.');
    }
    const { productId, quantity } = parsed.data;
    const product = detailProducts.find(candidate => candidate.id === productId);
    if (!product) return rejection(404, 'PRODUCT_NOT_FOUND', 'Unknown synthetic product.');
    if (!product.stockQuantity) return rejection(409, 'PRODUCT_OUT_OF_STOCK', 'This product is out of stock.');
    const total = (quantities.get(productId) ?? 0) + quantity;
    if (total > product.stockQuantity || options.rejectAddition) {
      return rejection(409, 'INSUFFICIENT_STOCK', 'Synthetic stock limit reached.');
    }
    quantities.set(productId, total);
    return { status: 201, body: snapshot() };
  }

  return {
    auth: () => options.authenticated ? { status: 200, body: signedIn } :
      rejection(401, 'REFRESH_TOKEN_REQUIRED', 'A valid refresh session is required.'),
    snapshot,
    add,
  };
}
