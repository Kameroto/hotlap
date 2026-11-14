import { writeFile } from 'node:fs/promises';
import { expect, test as base, type Page } from '@playwright/test';
import type { ApiErrorResponse, ServerCart } from '../../../apps/web/lib/api/types';

// These fields match ServerCart and getCartResponse; this ID exists only in the mock.
const emptyCart = {
  id: '00000000-0000-4000-8000-000000000001',
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  discountAmount: 0,
  totalBeforeShipping: 0,
  coupon: null,
  updatedAt: '2026-11-14T00:00:00.000Z',
} satisfies ServerCart;

const signedOut = {
  statusCode: 401,
  error: 'ApiError',
  code: 'REFRESH_TOKEN_REQUIRED',
  message: 'A valid refresh session is required.',
} satisfies ApiErrorResponse;

type RequestRecord = {
  method: string;
  path: string;
  disposition: 'mock-auth' | 'mock-cart' | 'allow-read' | 'blocked';
  reason?: string;
};

type Safety = {
  requests: RequestRecord[];
  checkpoints: Array<{ label: string; state: Awaited<ReturnType<typeof browserState>> }>;
  record: (label: string) => Promise<void>;
};

export async function browserState(page: Page) {
  return page.evaluate(() => {
    const active = document.activeElement;
    return {
      documentHasFocus: document.hasFocus(),
      focused: active ? {
        tag: active.tagName,
        id: active.id,
        role: active.getAttribute('role'),
        name: active.getAttribute('aria-label') ?? active.textContent?.trim().slice(0, 120),
        inModal: !!active.closest('dialog:modal'),
      } : null,
      dialogs: [...document.querySelectorAll('dialog')].map(dialog => ({
        id: dialog.id,
        open: dialog.open,
        modal: dialog.matches(':modal'),
        label: dialog.getAttribute('aria-label') ??
          document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent?.trim(),
        containsFocus: dialog.contains(active),
      })),
      disclosures: [...document.querySelectorAll('button[aria-expanded]')].map(button => ({
        name: button.getAttribute('aria-label') ?? button.textContent?.trim(),
        expanded: button.getAttribute('aria-expanded'),
      })),
      scroll: {
        x: window.scrollX,
        y: window.scrollY,
        bodyInlineOverflow: document.body.style.overflow,
        bodyComputedOverflow: getComputedStyle(document.body).overflow,
      },
    };
  });
}

export const test = base.extend<{ safety: Safety }>({
  // Explicitly empty even if the configuration later acquires a saved login state.
  storageState: { cookies: [], origins: [] },
  serviceWorkers: 'block',
  safety: [async ({ context, page }, use, testInfo) => {
    expect(await context.cookies(), 'fresh context has no customer cookies').toEqual([]);
    const requests: RequestRecord[] = [];
    const checkpoints: Safety['checkpoints'] = [];
    const errors: Array<{ kind: string; name?: string; method?: string; path?: string }> = [];
    page.on('pageerror', error => errors.push({ kind: 'pageerror', name: error.name }));
    page.on('requestfailed', request => errors.push({
      kind: 'requestfailed', method: request.method(), path: new URL(request.url()).pathname,
    }));

    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      const path = url.pathname;
      const isApi = path.startsWith('/api/v1/');
      const corsHeaders = {
        'access-control-allow-origin': request.headers().origin ?? 'http://localhost:3000',
        'access-control-allow-credentials': 'true',
      };
      // Do not log headers, cookies, query strings, bodies or customer data.
      const hasCredentials = !!request.headers().authorization ||
        /(?:^|;\s*)hotlap_refresh_token=/.test(request.headers().cookie ?? '');
      let reason: string | undefined;
      if (hasCredentials) reason = 'unexpected customer credentials';
      else if (isApi && path === '/api/v1/auth/refresh' && method === 'POST') {
        await route.fulfill({ status: 401, headers: corsHeaders, json: signedOut });
        requests.push({ method, path, disposition: 'mock-auth' });
        return;
      } else if (isApi && path === '/api/v1/cart' && method === 'GET') {
        await route.fulfill({ status: 200, headers: corsHeaders, json: emptyCart });
        requests.push({ method, path, disposition: 'mock-cart' });
        return;
      } else if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        reason = 'unexpected state-changing request';
      } else if (isApi && !/^\/api\/v1\/(categories|products(?:\/.*)?|events(?:\/.*)?|health|database)$/.test(path)) {
        // GET /cart is unsafe; unknown API GETs are blocked by default too.
        reason = 'API endpoint is not on the inspected read-only allowlist';
      }
      if (reason) {
        requests.push({ method, path, disposition: 'blocked', reason });
        await route.abort('blockedbyclient');
        return;
      }
      if (isApi) requests.push({ method, path, disposition: 'allow-read' });
      await route.continue();
    });

    const safety: Safety = {
      requests,
      checkpoints,
      record: async label => { checkpoints.push({ label, state: await browserState(page) }); },
    };
    try {
      await use(safety);
    } finally {
      if (!page.isClosed()) {
        await safety.record('final');
        if (testInfo.status !== testInfo.expectedStatus) {
          const screenshot = testInfo.outputPath('keyboard-failure.png');
          await page.screenshot({ path: screenshot }).then(() =>
            testInfo.attach('keyboard-failure', { path: screenshot, contentType: 'image/png' }),
          ).catch(() => undefined);
        }
      }
      const path = testInfo.outputPath('keyboard-safety.json');
      await writeFile(path, JSON.stringify({
        freshContext: true, serviceWorkers: 'blocked', requests, errors, checkpoints,
        scope: 'Browser requests only; Next.js server fetches are not intercepted.',
      }, null, 2));
      await testInfo.attach('keyboard-safety', { path, contentType: 'application/json' });
      expect(requests.filter(request => request.disposition === 'blocked'),
        'unexpected requests were blocked before reaching the server').toEqual([]);
    }
  }, { auto: true }],
});
