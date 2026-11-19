import { expect } from '@playwright/test';
import { test as base } from '../helpers/signed-out-test';

type Decision = { method: string; origin: string; path: string; decision: string };
type CatalogueSafety = { decisions: Decision[]; unexpected: string[] };
const storefront = 'http://127.0.0.1:3100';
const api = 'http://127.0.0.1:4100';

export const test = base.extend<{ catalogueSafety: CatalogueSafety }>({
  catalogueSafety: [async ({ context, page, safety }, use, testInfo) => {
    // Depending on safety installs this later: fallback reaches its auth/cart mocks.
    void safety;
    const decisions: Decision[] = [];
    const unexpected: string[] = [];
    const record = (method: string, url: URL, decision: string) => {
      if (decisions.length < 500) decisions.push({ method, origin: url.origin, path: url.pathname, decision });
      else if (!unexpected.includes('Request diagnostic bound exceeded')) unexpected.push('Request diagnostic bound exceeded');
    };
    page.on('pageerror', error => unexpected.push(`Unhandled page error: ${error.name}`));
    page.on('requestfailed', request => {
      const url = new URL(request.url());
      unexpected.push(`Request failed: ${request.method()} ${url.origin}${url.pathname}`);
    });
    page.on('response', response => {
      const url = new URL(response.url());
      const expectedSignedOut = url.origin === api && url.pathname === '/api/v1/auth/refresh' && response.status() === 401;
      if (response.status() >= 400 && !expectedSignedOut) unexpected.push(`HTTP ${response.status()}: ${url.origin}${url.pathname}`);
    });
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      const headers = request.headers();
      const credentials = !!(url.username || url.password || headers.authorization || headers['proxy-authorization'] || headers.cookie);
      const mock = url.origin === api && (
        (url.pathname === '/api/v1/auth/refresh' && method === 'POST') ||
        (url.pathname === '/api/v1/cart' && method === 'GET')
      );
      const read = ['GET', 'HEAD'].includes(method) && (
        (url.origin === storefront && !url.pathname.startsWith('/api/')) ||
        (url.origin === api && ['/api/v1/categories', '/api/v1/products'].includes(url.pathname))
      );
      if (credentials || !(mock || read)) {
        record(method, url, 'blocked');
        unexpected.push(`Prohibited request: ${method} ${url.origin}${url.pathname}`);
        await route.abort('blockedbyclient');
      } else {
        record(method, url, mock ? 'signed-out-mock' : 'allowed-read');
        await route.fallback();
      }
    });
    await context.routeWebSocket('**/*', socket => {
      const url = new URL(socket.url());
      if (url.origin === 'ws://127.0.0.1:3100' && url.pathname === '/_next/webpack-hmr' && !url.username && !url.password) {
        record('WEBSOCKET', url, 'allowed-hmr');
        socket.connectToServer();
      } else {
        record('WEBSOCKET', url, 'blocked');
        unexpected.push(`Prohibited WebSocket: ${url.origin}${url.pathname}`);
        socket.close({ code: 1008, reason: 'Isolated catalogue destination policy' });
      }
    });
    try {
      await use({ decisions, unexpected });
    } finally {
      await testInfo.attach('catalogue-network', {
        body: JSON.stringify({ decisions, unexpected, runnerDir: process.env.HOTLAP_CATALOGUE_RUNNER_DIR,
          scope: 'Browser routing plus runner protections; not an OS network sandbox.' }, null, 2),
        contentType: 'application/json',
      });
      expect(unexpected, 'No unexpected browser errors or prohibited requests').toEqual([]);
    }
  }, { auto: true }],
});

export { expect } from '@playwright/test';
