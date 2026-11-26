import assert from 'node:assert/strict';
import { test } from 'node:test';
import { classifyCanonicalRedirect, type ClassificationInput } from './canonical-redirect-classification';

// The complete Step 193 capture, transcribed from the retained CDP attachment.
const captured: NonNullable<ClassificationInput['diagnostic']> = {
  mainFrameId: "86C145223F09296510F49A53D1932B58",
  setupComplete: true,
  sessionDetached: true,
  eventLimit: 128,
  truncated: false,
  finalMainFrameUrl: "http://127.0.0.1:3100/products",
  unrecognizedNavigation: false,
  events: [
    {"sequence": 1, "event": "Page.frameStartedNavigating", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "9F077FAC7DDC89CC845D1822ED66F505", "url": "http://127.0.0.1:3100/products?page=1&sort=featured&pageSize=48&tracking=e2e", "navigationType": "differentDocument"},
    {"sequence": 2, "event": "Network.requestWillBeSent", "requestId": "9F077FAC7DDC89CC845D1822ED66F505", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "9F077FAC7DDC89CC845D1822ED66F505", "url": "http://127.0.0.1:3100/products?page=1&sort=featured&pageSize=48&tracking=e2e", "resourceType": "Document", "method": "GET", "timestamp": 29027.495937, "wallTime": 1795691962.262802, "initiatorType": "other"},
    {"sequence": 3, "event": "Network.responseReceived", "requestId": "9F077FAC7DDC89CC845D1822ED66F505", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "9F077FAC7DDC89CC845D1822ED66F505", "url": "http://127.0.0.1:3100/products?page=1&sort=featured&pageSize=48&tracking=e2e", "resourceType": "Document", "method": "GET", "timestamp": 29031.391886, "status": 200},
    {"sequence": 4, "event": "Page.frameNavigated", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "9F077FAC7DDC89CC845D1822ED66F505", "url": "http://127.0.0.1:3100/products?page=1&sort=featured&pageSize=48&tracking=e2e", "navigationType": "Navigation"},
    {"sequence": 5, "event": "Network.loadingFinished", "requestId": "9F077FAC7DDC89CC845D1822ED66F505", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "9F077FAC7DDC89CC845D1822ED66F505", "url": "http://127.0.0.1:3100/products?page=1&sort=featured&pageSize=48&tracking=e2e", "resourceType": "Document", "method": "GET", "timestamp": 29031.311466},
    {"sequence": 6, "event": "Page.frameScheduledNavigation", "frameId": "86C145223F09296510F49A53D1932B58", "url": "http://127.0.0.1:3100/products", "reason": "metaTagRefresh", "delay": 1},
    {"sequence": 7, "event": "Page.frameRequestedNavigation", "frameId": "86C145223F09296510F49A53D1932B58", "url": "http://127.0.0.1:3100/products", "reason": "metaTagRefresh", "disposition": "currentTab"},
    {"sequence": 8, "event": "Page.frameStartedNavigating", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "58A951F135966C5DBCC0B3658C793CBB", "url": "http://127.0.0.1:3100/products", "navigationType": "differentDocument"},
    {"sequence": 9, "event": "Network.requestWillBeSent", "requestId": "58A951F135966C5DBCC0B3658C793CBB", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "58A951F135966C5DBCC0B3658C793CBB", "url": "http://127.0.0.1:3100/products", "resourceType": "Document", "method": "GET", "timestamp": 29037.741157, "wallTime": 1795691972.496867, "initiatorType": "other"},
    {"sequence": 10, "event": "Page.frameClearedScheduledNavigation", "frameId": "86C145223F09296510F49A53D1932B58", "url": "http://127.0.0.1:3100/products"},
    {"sequence": 11, "event": "Page.frameScheduledNavigation", "frameId": "86C145223F09296510F49A53D1932B58", "url": "http://127.0.0.1:3100/products", "reason": "scriptInitiated", "delay": 0},
    {"sequence": 12, "event": "Page.frameRequestedNavigation", "frameId": "86C145223F09296510F49A53D1932B58", "url": "http://127.0.0.1:3100/products", "reason": "scriptInitiated", "disposition": "currentTab"},
    {"sequence": 13, "event": "Network.loadingFailed", "requestId": "58A951F135966C5DBCC0B3658C793CBB", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "58A951F135966C5DBCC0B3658C793CBB", "url": "http://127.0.0.1:3100/products", "resourceType": "Document", "method": "GET", "timestamp": 29038.202976, "canceled": true, "errorText": "net::ERR_ABORTED"},
    {"sequence": 14, "event": "Page.frameStartedNavigating", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "8F9962726C37CCC58B341AD3B5F8C524", "url": "http://127.0.0.1:3100/products", "navigationType": "differentDocument"},
    {"sequence": 15, "event": "Network.requestWillBeSent", "requestId": "8F9962726C37CCC58B341AD3B5F8C524", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "8F9962726C37CCC58B341AD3B5F8C524", "url": "http://127.0.0.1:3100/products", "resourceType": "Document", "method": "GET", "timestamp": 29038.219502, "wallTime": 1795691972.979606, "initiatorType": "script"},
    {"sequence": 16, "event": "Page.frameClearedScheduledNavigation", "frameId": "86C145223F09296510F49A53D1932B58", "url": "http://127.0.0.1:3100/products"},
    {"sequence": 17, "event": "Network.responseReceived", "requestId": "8F9962726C37CCC58B341AD3B5F8C524", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "8F9962726C37CCC58B341AD3B5F8C524", "url": "http://127.0.0.1:3100/products", "resourceType": "Document", "method": "GET", "timestamp": 29039.155214, "status": 200},
    {"sequence": 18, "event": "Page.frameNavigated", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "8F9962726C37CCC58B341AD3B5F8C524", "url": "http://127.0.0.1:3100/products", "navigationType": "Navigation"},
    {"sequence": 19, "event": "Network.loadingFinished", "requestId": "8F9962726C37CCC58B341AD3B5F8C524", "frameId": "86C145223F09296510F49A53D1932B58", "loaderId": "8F9962726C37CCC58B341AD3B5F8C524", "url": "http://127.0.0.1:3100/products", "resourceType": "Document", "method": "GET", "timestamp": 29039.398307},
  ],
};

const initial = 'http://127.0.0.1:3100/products?page=1&sort=featured&pageSize=48&tracking=e2e';
const canonical = 'http://127.0.0.1:3100/products';
const document = { method: 'GET', resourceType: 'document', navigation: true, mainFrame: true, allowedRead: true };
const positive: ClassificationInput = {
  authorization: {
    kind: 'explicit-defaults-redirect',
    testTitle: 'explicit defaults and unsupported query parameters are removed from the catalogue URL',
  },
  functionalAssertionsCompleted: true,
  diagnostic: captured,
  playwrightEvidenceComplete: true,
  documents: [
    { ...document, id: 1, url: initial, status: 200, finished: true },
    { ...document, id: 2, url: canonical, finished: false },
    { ...document, id: 3, url: canonical, status: 200, finished: true },
  ],
  failures: [{
    unexpectedIndex: 0, requestId: 2, inObservation: true, url: canonical,
    method: 'GET', resourceType: 'document', errorText: 'net::ERR_ABORTED',
  }],
  otherUnexpectedCount: 0,
};

test('ordinary successful navigation has no relevant request failure', () => {
  assert.deepEqual(classifyCanonicalRedirect({
    functionalAssertionsCompleted: true, playwrightEvidenceComplete: true,
    documents: [{ ...document, id: 1, url: canonical, status: 200, finished: true }],
    failures: [], otherUnexpectedCount: 0,
  }), { outcome: 'no-relevant-failure', reason: 'no-unexpected-events' });
});

test('the recorded supersession reconciles exactly one Playwright failure', () => {
  assert.deepEqual(classifyCanonicalRedirect(positive), {
    outcome: 'verified-recovery',
    reason: 'canonical-document-superseded',
    failure: positive.failures[0],
    canceled: { requestId: '58A951F135966C5DBCC0B3658C793CBB', loaderId: '58A951F135966C5DBCC0B3658C793CBB' },
    replacement: { requestId: '8F9962726C37CCC58B341AD3B5F8C524', loaderId: '8F9962726C37CCC58B341AD3B5F8C524' },
  });
});

type Mutation = (input: ClassificationInput) => void;
const diagnostic = (input: ClassificationInput) => input.diagnostic!;
const event = (sequence: number, fields: Record<string, unknown>): Mutation =>
  input => { Object.assign(diagnostic(input).events[sequence - 1], fields); };
const remove = (...sequences: number[]): Mutation => input => {
  const evidence = diagnostic(input);
  evidence.events = evidence.events.filter(item => !sequences.includes(item.sequence))
    .map((item, index) => ({ ...item, sequence: index + 1 }));
};

const cases: [string, Mutation][] = [
  ['classification was not explicitly authorized', input => { delete input.authorization; }],
  ['authorization names a different test', input => { input.authorization!.testTitle = 'another test'; }],
  ['functional assertions did not complete', input => { input.functionalAssertionsCompleted = false; }],
  ['CDP evidence is missing', input => { delete input.diagnostic; }],
  ['CDP setup failed', input => { diagnostic(input).setupComplete = false; }],
  ['CDP detach failed', input => { diagnostic(input).sessionDetached = false; }],
  ['CDP evidence is truncated', input => { diagnostic(input).truncated = true; }],
  ['protocol sequence is incoherent', event(13, { sequence: 12 })],
  ['required loader identity is missing', event(9, { loaderId: '' })],
  ['initial deep link is wrong', event(2, { url: canonical })],
  ['canonical destination is wrong', event(9, { url: initial })],
  ['failed request belongs to a different frame', event(13, { frameId: 'other-frame' })],
  ['meta-refresh intent is missing', remove(7)],
  ['script intent is missing', remove(12)],
  ['script intent is received after cancellation', input => {
    const events = [...diagnostic(input).events];
    [events[11], events[12]] = [events[12], events[11]];
    diagnostic(input).events = events.map((item, index) => ({ ...item, sequence: index + 1 }));
  }],
  ['failed Playwright request is not a document', input => { input.documents[1].resourceType = 'fetch'; }],
  ['failed Playwright request is not a navigation', input => { input.documents[1].navigation = false; }],
  ['failed Playwright request is not GET', input => { input.documents[1].method = 'POST'; }],
  ['failed loader committed before cancellation', input => {
    const events = [...diagnostic(input).events];
    events.splice(12, 0, {
      sequence: 13, event: 'Page.frameNavigated', frameId: captured.mainFrameId!, url: canonical,
      loaderId: '58A951F135966C5DBCC0B3658C793CBB', navigationType: 'Navigation',
    });
    diagnostic(input).events = events.map((item, index) => ({ ...item, sequence: index + 1 }));
  }],
  ['failed document received a response', input => { input.documents[1].status = 200; }],
  ['Chromium canceled is false', event(13, { canceled: false })],
  ['Chromium canceled is absent', event(13, { canceled: undefined })],
  ['Chromium supplied a blocked reason', event(13, { blockedReason: 'inspector' })],
  ['failed request lacks its own allowed-read decision', input => { input.documents[1].allowedRead = false; }],
  ['connection refused remains a failure', event(13, { errorText: 'net::ERR_CONNECTION_REFUSED' })],
  ['generic network failure remains a failure', event(13, { errorText: 'net::ERR_FAILED' })],
  ['an unrelated resource abort cannot reconcile', input => { input.failures[0].resourceType = 'stylesheet'; }],
  ['replacement request is absent', remove(14, 15, 17, 18, 19)],
  ['replacement reuses request identity', event(15, { requestId: '58A951F135966C5DBCC0B3658C793CBB' })],
  ['replacement reuses loader identity', event(15, { loaderId: '58A951F135966C5DBCC0B3658C793CBB' })],
  ['replacement initiator is not script', event(15, { initiatorType: 'other' })],
  ['replacement returns HTTP 404', event(17, { status: 404 })],
  ['replacement returns HTTP 500', event(17, { status: 500 })],
  ['replacement response lacks a frame commit', remove(18)],
  ['replacement commit uses a different loader', event(18, { loaderId: 'other-loader' })],
  ['replacement never finishes loading', remove(19)],
  ['replacement subsequently fails', input => {
    const events = diagnostic(input).events;
    diagnostic(input).events = [...events, {
      sequence: 20, event: 'Network.loadingFailed', frameId: captured.mainFrameId!, url: canonical,
      requestId: '8F9962726C37CCC58B341AD3B5F8C524', loaderId: '8F9962726C37CCC58B341AD3B5F8C524',
      method: 'GET', resourceType: 'Document', timestamp: 29039.5, errorText: 'net::ERR_FAILED',
    }];
  }],
  ['final URL is not canonical', input => { diagnostic(input).finalMainFrameUrl = initial; }],
  ['no Playwright failure matches the canceled request', input => { input.failures[0].requestId = undefined; }],
  ['multiple Playwright failures are not eligible', input => {
    input.failures = [...input.failures, { ...input.failures[0], unexpectedIndex: 1 }];
  }],
  ['ambiguous Playwright association is rejected', input => {
    input.documents = [input.documents[0], input.documents[1], { ...input.documents[2], id: 2 }];
  }],
  ['an additional redacted main-frame navigation was observed', input => { diagnostic(input).unrecognizedNavigation = true; }],
  ['failure outside the observation window is rejected', input => { input.failures[0].inObservation = false; }],
  ['a verified-looking candidate with an unrelated failure remains unexpected', input => {
    input.failures = [...input.failures, {
      ...input.failures[0], unexpectedIndex: 1, requestId: undefined, resourceType: 'image', url: undefined,
    }];
  }],
  ['a candidate accompanied by a prohibited request remains unexpected', input => { input.otherUnexpectedCount = 1; }],
  ['a candidate accompanied by a browser page error remains unexpected', input => { input.otherUnexpectedCount = 1; }],
  ['a valid sequence without the opt-in kind is rejected', input => {
    Object.assign(input.authorization!, { kind: undefined });
  }],
];

for (const [label, mutate] of cases) {
  test(label, () => {
    const input = structuredClone(positive);
    mutate(input);
    const result = classifyCanonicalRedirect(input);
    assert.equal(result.outcome, 'unexpected');
  });
}
