import { expect, type Request } from '@playwright/test';
import { test as base } from '../helpers/signed-out-test';
import {
  classifyCanonicalRedirect, explicitDefaultsTitle, isDiagnosticUrl,
  type NavigationEvidence, type PlaywrightDocument, type PlaywrightFailure, type RedirectAuthorization,
} from './canonical-redirect-classification';

export type CanonicalRedirectObservation = {
  start: () => void;
  stop: () => void;
  complete: (diagnostic: NavigationEvidence | undefined, functionalAssertionsCompleted: boolean) => void;
};

type Decision = { method: string; origin: string; path: string; decision: string };
type CatalogueSafety = {
  decisions: Decision[];
  unexpected: string[];
  authorizeCanonicalRedirect: (kind: RedirectAuthorization['kind']) => CanonicalRedirectObservation;
};
const storefront = 'http://127.0.0.1:3100';
const api = 'http://127.0.0.1:4100';

export const test = base.extend<{ catalogueSafety: CatalogueSafety }>({
  catalogueSafety: [async ({ context, page, safety }, use, testInfo) => {
    // Depending on safety installs this later: fallback reaches its auth/cart mocks.
    void safety;
    const decisions: Decision[] = [];
    const unexpected: string[] = [];
    let authorization: RedirectAuthorization | undefined;
    let phase: 'registered' | 'active' | 'sealed' | undefined;
    let diagnostic: NavigationEvidence | undefined;
    let functionalAssertionsCompleted = false;
    let playwrightEvidenceComplete = true;
    const documents = new Map<Request, PlaywrightDocument>();
    const failures: PlaywrightFailure[] = [];

    function authorizeCanonicalRedirect(kind: RedirectAuthorization['kind']): CanonicalRedirectObservation {
      if (authorization || kind !== 'explicit-defaults-redirect' || testInfo.title !== explicitDefaultsTitle) {
        throw new Error('Invalid or duplicate canonical redirect authorization');
      }
      authorization = { kind, testTitle: testInfo.title };
      phase = 'registered';
      return {
        start() {
          if (phase !== 'registered') throw new Error('Canonical redirect observation already started');
          phase = 'active';
        },
        stop() { phase = 'sealed'; },
        complete(evidence, completed) {
          if (phase !== 'sealed' || diagnostic) throw new Error('Invalid canonical redirect observation completion');
          diagnostic = evidence;
          functionalAssertionsCompleted = completed;
        },
      };
    }

    page.on('request', request => {
      if (!authorization || (!request.isNavigationRequest() && request.resourceType() !== 'document')) return;
      if (phase !== 'active' || documents.size >= 128 || documents.has(request)) {
        playwrightEvidenceComplete = false;
        return;
      }
      let mainFrame = false;
      try {
        mainFrame = request.frame() === page.mainFrame();
      } catch {
        // A frame unavailable at request emission cannot supply positive evidence.
        playwrightEvidenceComplete = false;
      }
      documents.set(request, {
        id: documents.size + 1,
        url: isDiagnosticUrl(request.url()) ? request.url() : undefined,
        method: request.method(), resourceType: request.resourceType(), navigation: request.isNavigationRequest(),
        mainFrame, allowedRead: false, finished: false,
      });
    });
    page.on('requestfinished', request => {
      const document = documents.get(request);
      if (phase === 'active' && document) document.finished = true;
    });

    const record = (method: string, url: URL, decision: string) => {
      if (decisions.length < 500) {
        decisions.push({ method, origin: url.origin, path: url.pathname, decision });
        return true;
      }
      if (!unexpected.includes('Request diagnostic bound exceeded')) unexpected.push('Request diagnostic bound exceeded');
      return false;
    };
    page.on('pageerror', error => unexpected.push(`Unhandled page error: ${error.name}`));
    page.on('requestfailed', request => {
      const url = new URL(request.url());
      if (authorization && failures.length < 128) {
        const errorText = request.failure()?.errorText;
        failures.push({
          unexpectedIndex: unexpected.length,
          requestId: documents.get(request)?.id,
          inObservation: phase === 'active',
          url: isDiagnosticUrl(request.url()) ? request.url() : undefined,
          method: request.method(), resourceType: request.resourceType(),
          errorText: errorText && /^net::ERR_[A-Z0-9_]+$/.test(errorText) ? errorText : undefined,
        });
      }
      unexpected.push(`Request failed: ${request.method()} ${url.origin}${url.pathname}`);
    });
    page.on('response', response => {
      const document = documents.get(response.request());
      if (phase === 'active' && document) document.status = response.status();
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
        const recorded = record(method, url, mock ? 'signed-out-mock' : 'allowed-read');
        const document = documents.get(request);
        if (recorded && document && !mock && phase === 'active') document.allowedRead = true;
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
      await use({ decisions, unexpected, authorizeCanonicalRedirect });
    } finally {
      function reconcile() {
        const classification = classifyCanonicalRedirect({
          authorization, functionalAssertionsCompleted, diagnostic,
          documents: [...documents.values()], failures, playwrightEvidenceComplete,
          otherUnexpectedCount: unexpected.length - failures.length,
        });
        const acceptedIndex = classification.outcome === 'verified-recovery'
          ? classification.failure.unexpectedIndex : undefined;
        return { classification, unresolved: unexpected.filter((_event, index) => index !== acceptedIndex) };
      }

      const initial = authorization ? reconcile() : undefined;
      await testInfo.attach('catalogue-network', {
        body: JSON.stringify({ decisions, unexpected, runnerDir: process.env.HOTLAP_CATALOGUE_RUNNER_DIR,
          scope: 'Browser routing plus runner protections; not an OS network sandbox.',
          canonicalRedirect: initial && {
            authorization, functionalAssertionsCompleted, playwrightEvidenceComplete,
            diagnosticIntegrity: diagnostic && {
              setupComplete: diagnostic.setupComplete, sessionDetached: diagnostic.sessionDetached,
              mainFrameId: diagnostic.mainFrameId, truncated: diagnostic.truncated,
              unrecognizedNavigation: diagnostic.unrecognizedNavigation, eventLimit: diagnostic.eventLimit,
            },
            documents: [...documents.values()], failures, ...initial,
          },
        }, null, 2),
        contentType: 'application/json',
      });
      // Events arriving while attaching diagnostics must still fail teardown.
      const unresolved = authorization ? reconcile().unresolved : unexpected;
      expect(unresolved, 'No unexpected browser errors or prohibited requests').toEqual([]);
    }
  }, { auto: true }],
});

export { expect } from '@playwright/test';
