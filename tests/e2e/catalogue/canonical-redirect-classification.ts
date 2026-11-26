export const canonicalUrl = 'http://127.0.0.1:3100/products';
export const explicitDefaultsPath = '/products?page=1&sort=featured&pageSize=48&tracking=e2e';
export const explicitDefaultsUrl = `http://127.0.0.1:3100${explicitDefaultsPath}`;
export const explicitDefaultsTitle = 'explicit defaults and unsupported query parameters are removed from the catalogue URL';

export function isDiagnosticUrl(url: string) {
  return url === canonicalUrl || url === explicitDefaultsUrl;
}

type FrameFields = { frameId: string; url: string };
type LoaderFields = FrameFields & { loaderId: string };
export type DocumentFields = LoaderFields & { requestId: string; resourceType: string; method: string };

export type NavigationEvent =
  | (FrameFields & { event: 'Page.frameRequestedNavigation'; reason: string; disposition: string })
  | (FrameFields & { event: 'Page.frameScheduledNavigation'; reason: string; delay: number })
  | (FrameFields & { event: 'Page.frameClearedScheduledNavigation' })
  | (LoaderFields & { event: 'Page.frameStartedNavigating' | 'Page.frameNavigated'; navigationType: string })
  | (DocumentFields & {
    event: 'Network.requestWillBeSent'; timestamp: number; wallTime: number; initiatorType: string;
    redirectFrom?: string; redirectStatus?: number;
  })
  | (DocumentFields & { event: 'Network.responseReceived'; timestamp: number; status: number })
  | (DocumentFields & { event: 'Network.loadingFinished'; timestamp: number })
  | (DocumentFields & {
    event: 'Network.loadingFailed'; timestamp: number; errorText: string; canceled?: boolean; blockedReason?: string;
  });

export type NavigationEvidence = {
  mainFrameId?: string;
  setupComplete: boolean;
  sessionDetached: boolean;
  eventLimit: number;
  truncated: boolean;
  unrecognizedNavigation: boolean;
  finalMainFrameUrl?: string;
  events: readonly (NavigationEvent & { sequence: number })[];
};

export type PlaywrightDocument = {
  id: number;
  url?: string;
  method: string;
  resourceType: string;
  navigation: boolean;
  mainFrame: boolean;
  allowedRead: boolean;
  status?: number;
  finished: boolean;
};

export type PlaywrightFailure = {
  unexpectedIndex: number;
  requestId?: number;
  inObservation: boolean;
  url?: string;
  method: string;
  resourceType: string;
  errorText?: string;
};

export type RedirectAuthorization = { kind: 'explicit-defaults-redirect'; testTitle: string };

export type ClassificationInput = {
  authorization?: RedirectAuthorization;
  functionalAssertionsCompleted: boolean;
  diagnostic?: NavigationEvidence;
  documents: readonly PlaywrightDocument[];
  failures: readonly PlaywrightFailure[];
  otherUnexpectedCount: number;
  playwrightEvidenceComplete: boolean;
};

type RejectionReason =
  | 'not-authorized' | 'functional-assertions-incomplete' | 'diagnostics-missing' | 'diagnostics-incomplete'
  | 'additional-unexpected-events' | 'protocol-sequence-mismatch' | 'playwright-reconciliation-failed';

export type RedirectClassification =
  | { outcome: 'no-relevant-failure'; reason: 'no-unexpected-events' }
  | { outcome: 'unexpected'; reason: RejectionReason }
  | {
    outcome: 'verified-recovery';
    reason: 'canonical-document-superseded';
    failure: PlaywrightFailure & { requestId: number };
    canceled: { requestId: string; loaderId: string };
    replacement: { requestId: string; loaderId: string };
  };

function reject(reason: RejectionReason): RedirectClassification {
  return { outcome: 'unexpected', reason };
}

function matchProtocol(evidence: NavigationEvidence, frameId: string) {
  const { events } = evidence;
  const starts = events.filter(event => event.event === 'Network.requestWillBeSent');
  if (starts.length !== 3 || new Set(starts.map(event => event.requestId)).size !== 3 ||
      new Set(starts.map(event => event.loaderId)).size !== 3 ||
      starts.some(event => !event.requestId || !event.loaderId)) return;

  const [initial, canceled, replacement] = starts;
  const root = { frameId, url: explicitDefaultsUrl };
  const target = { frameId, url: canonicalUrl };
  const identity = ({ requestId, loaderId }: DocumentFields) => ({ requestId, loaderId });
  const get = { resourceType: 'Document', method: 'GET' };
  const initialDocument = { ...root, ...identity(initial), ...get };
  const canceledDocument = { ...target, ...identity(canceled), ...get };
  const replacementDocument = { ...target, ...identity(replacement), ...get };
  const noRedirect = { redirectFrom: undefined, redirectStatus: undefined };
  const expected = [
    { event: 'Page.frameStartedNavigating', ...root, loaderId: initial.loaderId, navigationType: 'differentDocument' },
    { event: 'Network.requestWillBeSent', ...initialDocument, ...noRedirect, initiatorType: 'other' },
    { event: 'Network.responseReceived', ...initialDocument, status: 200 },
    { event: 'Page.frameNavigated', ...root, loaderId: initial.loaderId, navigationType: 'Navigation' },
    { event: 'Network.loadingFinished', ...initialDocument },
    { event: 'Page.frameScheduledNavigation', ...target, reason: 'metaTagRefresh', delay: 1 },
    { event: 'Page.frameRequestedNavigation', ...target, reason: 'metaTagRefresh', disposition: 'currentTab' },
    { event: 'Page.frameStartedNavigating', ...target, loaderId: canceled.loaderId, navigationType: 'differentDocument' },
    { event: 'Network.requestWillBeSent', ...canceledDocument, ...noRedirect, initiatorType: 'other' },
    { event: 'Page.frameClearedScheduledNavigation', ...target },
    { event: 'Page.frameScheduledNavigation', ...target, reason: 'scriptInitiated', delay: 0 },
    { event: 'Page.frameRequestedNavigation', ...target, reason: 'scriptInitiated', disposition: 'currentTab' },
    { event: 'Network.loadingFailed', ...canceledDocument, errorText: 'net::ERR_ABORTED', canceled: true, blockedReason: undefined },
    { event: 'Page.frameStartedNavigating', ...target, loaderId: replacement.loaderId, navigationType: 'differentDocument' },
    { event: 'Network.requestWillBeSent', ...replacementDocument, ...noRedirect, initiatorType: 'script' },
    { event: 'Page.frameClearedScheduledNavigation', ...target },
    { event: 'Network.responseReceived', ...replacementDocument, status: 200 },
    { event: 'Page.frameNavigated', ...target, loaderId: replacement.loaderId, navigationType: 'Navigation' },
    { event: 'Network.loadingFinished', ...replacementDocument },
  ];
  if (events.length !== expected.length || !expected.every((fields, index) => {
    const actual: Record<string, unknown> = events[index];
    return actual.sequence === index + 1 && Object.entries(fields).every(([key, value]) => actual[key] === value);
  })) return;

  const timestamps = events.flatMap(event => 'timestamp' in event ? [event.timestamp] : []);
  if (timestamps.length !== 8 || !timestamps.every(Number.isFinite)) return;
  const [initialStart, initialResponse, initialFinish, firstStart, firstFailure, nextStart, nextResponse, nextFinish] = timestamps;
  // The initial response and completion can be delivered out of timestamp order.
  if (initialStart > Math.min(initialResponse, initialFinish) || Math.max(initialResponse, initialFinish) > firstStart ||
      firstStart > firstFailure || firstFailure > nextStart || nextStart > nextResponse || nextResponse > nextFinish) return;

  return { canceled: identity(canceled), replacement: identity(replacement) };
}

export function classifyCanonicalRedirect(input: ClassificationInput): RedirectClassification {
  if (!input.failures.length && !input.otherUnexpectedCount) {
    return { outcome: 'no-relevant-failure', reason: 'no-unexpected-events' };
  }
  if (input.authorization?.kind !== 'explicit-defaults-redirect' ||
      input.authorization.testTitle !== explicitDefaultsTitle) return reject('not-authorized');
  if (!input.functionalAssertionsCompleted) return reject('functional-assertions-incomplete');
  const evidence = input.diagnostic;
  if (!evidence) return reject('diagnostics-missing');
  if (!evidence.setupComplete || !evidence.sessionDetached || !evidence.mainFrameId ||
      evidence.truncated || evidence.eventLimit !== 128 || evidence.unrecognizedNavigation ||
      evidence.finalMainFrameUrl !== canonicalUrl) return reject('diagnostics-incomplete');

  if (input.otherUnexpectedCount || input.failures.length > 1) return reject('additional-unexpected-events');
  const proven = matchProtocol(evidence, evidence.mainFrameId);
  if (!proven) return reject('protocol-sequence-mismatch');

  const [initial, canceled, replacement] = input.documents;
  const [failure] = input.failures;
  if (!input.playwrightEvidenceComplete || input.documents.length !== 3 ||
      new Set(input.documents.map(document => document.id)).size !== 3 ||
      input.documents.some(document => !document.allowedRead || !document.mainFrame || !document.navigation ||
        document.resourceType !== 'document' || document.method !== 'GET') ||
      initial.url !== explicitDefaultsUrl || canceled.url !== canonicalUrl || replacement.url !== canonicalUrl ||
      initial.status !== 200 || !initial.finished || canceled.status !== undefined || canceled.finished ||
      replacement.status !== 200 || !replacement.finished ||
      !failure || failure.requestId !== canceled.id || !failure.inObservation ||
      failure.url !== canonicalUrl || failure.method !== 'GET' || failure.resourceType !== 'document' ||
      failure.errorText !== 'net::ERR_ABORTED') return reject('playwright-reconciliation-failed');

  return {
    outcome: 'verified-recovery', reason: 'canonical-document-superseded',
    failure: { ...failure, requestId: canceled.id }, ...proven,
  };
}
