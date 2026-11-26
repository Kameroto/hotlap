import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import type { ApiErrorResponse, CategoriesResponse } from '../../../apps/web/lib/api/types';
import type { ProductListResponse } from '../../../apps/web/types/product';
import {
  productQuerySchema,
  productSortValues,
  type ProductQuery,
} from '../../../services/api/src/products/product-query-schema';
import { catalogueCategories, catalogueProducts } from './catalogue-data';
import { paginationCategories, paginationProducts } from './catalogue-pagination-data';

const datasets = {
  default: { categories: catalogueCategories, products: catalogueProducts },
  pagination: { categories: paginationCategories, products: paginationProducts },
};

export type CatalogueProfile = keyof typeof datasets;

export function resolveCatalogueProfile(value: unknown = 'default'): CatalogueProfile {
  if (value === 'default' || value === 'pagination') return value;
  throw new Error('Invalid catalogue fixture profile');
}

export const DIAGNOSTIC_LIMIT = 100;
export const STOREFRONT_ORIGIN = 'http://127.0.0.1:3100';

type Diagnostic = {
  sequence: number;
  method: string;
  path: string;
  query: Record<string, string>;
  status: number;
};

function listProducts(query: ProductQuery, datasetProducts: readonly ProductListResponse['products'][number][]): ProductListResponse {
  const search = query.search?.toLowerCase();
  const products = datasetProducts.filter(product =>
    (!search || [product.name, product.brand, product.sku, product.shortDescription,
      product.description].some(value => value.toLowerCase().includes(search))) &&
    (!query.category || product.category.slug === query.category) &&
    (!query.brand || product.brand.toLowerCase() === query.brand.toLowerCase()) &&
    (query.minimumPrice === undefined || product.price >= query.minimumPrice) &&
    (query.maximumPrice === undefined || product.price <= query.maximumPrice) &&
    (query.inStock === undefined || (product.stockQuantity > 0) === query.inStock) &&
    (query.featured === undefined || product.isFeatured === query.featured),
  );
  products.sort((a, b) => {
    switch (query.sort) {
      case 'newest': return b.createdAt.localeCompare(a.createdAt);
      case 'price-asc': return a.price - b.price || a.name.localeCompare(b.name);
      case 'price-desc': return b.price - a.price || a.name.localeCompare(b.name);
      case 'rating': return b.ratingAverage - a.ratingAverage || b.reviewCount - a.reviewCount;
      case 'name': return a.name.localeCompare(b.name);
      case 'featured': return Number(b.isFeatured) - Number(a.isFeatured) ||
        b.createdAt.localeCompare(a.createdAt);
    }
  });
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / query.pageSize);
  const start = (query.page - 1) * query.pageSize;
  return {
    products: products.slice(start, start + query.pageSize),
    pagination: {
      page: query.page, pageSize: query.pageSize, totalItems, totalPages,
      hasPreviousPage: query.page > 1, hasNextPage: query.page < totalPages,
    },
    filters: {
      search: query.search ?? null, category: query.category ?? null,
      brand: query.brand ?? null, minimumPrice: query.minimumPrice ?? null,
      maximumPrice: query.maximumPrice ?? null, inStock: query.inStock ?? null,
      featured: query.featured ?? null, sort: query.sort,
    },
  };
}

// Preserve repeated query keys as arrays, so the backend's schema rejects them.
function queryObject(params: URLSearchParams): Record<string, string | string[]> {
  return Object.fromEntries([...new Set(params.keys())].map(key => {
    const values = params.getAll(key);
    return [key, values.length === 1 ? values[0] : values];
  }));
}

function safeQuery(params: URLSearchParams, categories: CategoriesResponse): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(productQuerySchema.shape)) {
    if (!params.has(key)) continue;
    const value = params.get(key)!;
    const safe = (['page', 'pageSize', 'minimumPrice', 'maximumPrice'].includes(key) &&
      /^\d{1,8}(\.\d{1,2})?$/.test(value)) ||
      (key === 'sort' && productSortValues.some(sort => sort === value)) ||
      (['featured', 'inStock'].includes(key) && ['true', 'false'].includes(value)) ||
      (key === 'category' && categories.categories.some(category => category.slug === value));
    result[key] = safe && params.getAll(key).length === 1 ? value : '[redacted]';
  }
  return result;
}

/** Starts only an owned, loopback fixture. No application bootstrap or outbound requests. */
export async function startCatalogueFixture(port = 0, options: { profile?: CatalogueProfile } = {}) {
  const { categories, products } = datasets[resolveCatalogueProfile(options.profile)];
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid fixture port');
  const runId = randomUUID();
  const requests: Diagnostic[] = [];
  let sequence = 0;
  const server = createServer((request, response) => {
    let url = new URL('/', 'http://127.0.0.1');
    let invalidUrl = false;
    try { url = new URL(request.url ?? '/', 'http://127.0.0.1'); }
    catch { invalidUrl = true; }
    const method = request.method ?? 'UNKNOWN';
    const knownPaths = ['/api/v1/categories', '/api/v1/products',
      '/__fixture/health', '/__fixture/requests'];
    const detailMatch = /^\/api\/v1\/products\/([^/]+)$/.exec(url.pathname);
    let slug = '';
    let invalidSlug = false;
    try { slug = decodeURIComponent(detailMatch?.[1] ?? '').trim(); }
    catch { invalidSlug = true; }
    const detail = !!detailMatch && slug !== 'featured';
    const product = detail ? products.find(item => item.slug === slug) : undefined;
    const known = knownPaths.includes(url.pathname) || detail;
    const path = knownPaths.includes(url.pathname) ? url.pathname : product ?
      `/api/v1/products/${product.slug}` :
      detail ? '/api/v1/products/<unknown>' : '/<unsupported>';
    const send = (status: number, body?: unknown) => {
      requests.push({ sequence: ++sequence, method, path, query: safeQuery(url.searchParams, categories), status });
      if (requests.length > DIAGNOSTIC_LIMIT) requests.shift();
      response.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      });
      response.end(body === undefined ? undefined : JSON.stringify(body));
    };
    const error = (statusCode: number, code: string, message: string, details?: unknown) =>
      send(statusCode, { statusCode, error: 'ApiError', code, message,
        ...(details === undefined ? {} : { details }) } satisfies ApiErrorResponse);
    // Drain without parsing or recording bodies. No route can mutate business data.
    request.resume();
    if (invalidUrl) {
      error(400, 'FIXTURE_INVALID_URL', 'Invalid fixture request URL.');
      return;
    }
    const origin = request.headers.origin;
    if (origin && origin !== STOREFRONT_ORIGIN) {
      error(403, 'FIXTURE_ORIGIN_FORBIDDEN', 'Origin is not permitted.');
      return;
    }
    if (origin) {
      response.setHeader('access-control-allow-origin', STOREFRONT_ORIGIN);
      response.setHeader('access-control-allow-credentials', 'true');
      response.setHeader('vary', 'Origin');
    }
    if (request.headers.authorization || request.headers.cookie) {
      error(400, 'FIXTURE_CREDENTIALS_FORBIDDEN', 'Customer credentials are not permitted.');
      return;
    }
    if (!known) {
      error(404, 'FIXTURE_ROUTE_NOT_FOUND', 'Unsupported fixture endpoint.');
      return;
    }
    if (method === 'OPTIONS' && origin === STOREFRONT_ORIGIN &&
        request.headers['access-control-request-method'] === 'GET' &&
        (!request.headers['access-control-request-headers'] ||
          request.headers['access-control-request-headers'].split(',')
            .every(header => ['accept', 'content-type'].includes(header.trim().toLowerCase())))) {
      response.setHeader('access-control-allow-methods', 'GET');
      response.setHeader('access-control-allow-headers', 'accept, content-type');
      send(204);
      return;
    }
    if (method !== 'GET') {
      response.setHeader('allow', 'GET');
      error(405, 'FIXTURE_METHOD_NOT_ALLOWED', 'Only read-only GET requests are supported.');
      return;
    }
    if (url.pathname === '/__fixture/health') {
      send(200, { fixture: 'hotlap-catalogue', runId, readOnly: true });
    } else if (url.pathname === '/__fixture/requests') {
      send(200, { requests: [...requests], limit: DIAGNOSTIC_LIMIT });
    } else if (url.pathname === '/api/v1/categories') {
      send(200, categories);
    } else if (url.pathname === '/api/v1/products') {
      const parsed = productQuerySchema.safeParse(queryObject(url.searchParams));
      if (!parsed.success) {
        error(400, 'INVALID_PRODUCT_QUERY', 'The product filters are invalid.',
          parsed.error.flatten().fieldErrors);
      } else send(200, listProducts(parsed.data, products));
    } else if (invalidSlug || !slug) {
      error(400, 'PRODUCT_SLUG_REQUIRED', 'A product slug is required.');
    } else if (product) send(200, { product });
    else error(404, 'PRODUCT_NOT_FOUND', 'The requested product was not found.');
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing fixture address');
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  };
}
