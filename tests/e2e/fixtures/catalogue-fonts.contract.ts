import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { test, type TestContext } from 'node:test';
import { catalogueFontRoute, catalogueFontStylesheets, loadCatalogueFonts, startCatalogueFontServer } from '../helpers/catalogue-fonts';

const fonts = loadCatalogueFonts();

test('the self-contained licensed bundle verifies all hashes and covers all three requested families', () => {
  assert.equal(fonts.assets.length, 16);
  assert.deepEqual([...new Set(fonts.assets.map(a => a.family))].sort(), ['Geist Mono', 'Rubik', 'Tomorrow']);
  assert.equal(fonts.assets.reduce((sum, a) => sum + a.bytes, 0), 225580);
});

test('mock stylesheets use the installed request contract and only allowlisted query-free font URLs', () => {
  const data = catalogueFontStylesheets(fonts, 'http://127.0.0.1:45000');
  assert.deepEqual(Object.keys(data).sort(), [
    'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap',
    'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600&display=swap',
    'https://fonts.googleapis.com/css2?family=Tomorrow:ital,wght@0,700;1,700&display=swap',
  ]);
  for (const css of Object.values(data)) {
    assert.ok(!css.includes('__FONT_ORIGIN__'));
    for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
      const url = new URL(match[1]);
      assert.equal(url.origin, 'http://127.0.0.1:45000'); assert.equal(url.search, '');
      assert.equal(catalogueFontRoute(fonts, 'GET', url.pathname).status, 200);
    }
  }
});

test('every approved asset permits GET and HEAD without exposing another path', () => {
  for (const asset of fonts.assets) for (const method of ['GET', 'HEAD']) {
    assert.deepEqual(catalogueFontRoute(fonts, method, `/fonts/${asset.name}`), { status: 200, name: asset.name });
  }
});

for (const target of ['/', '/fonts/', '/fonts/../manifest.json', '/fonts/%2e%2e/licenses/rubik-OFL.txt',
  '/fonts/%2fetc%2fpasswd.woff2', '/fonts/not-approved.woff2', `/fonts/${fonts.assets[0].name}?v=1`,
  `http://elsewhere.invalid/fonts/${fonts.assets[0].name}`, `/fonts/${fonts.assets[0].name}/extra`]) {
  test(`raw target ${target} cannot escape the allowlist`, () => {
    assert.equal(catalogueFontRoute(fonts, 'GET', target).status, 404);
  });
}

test('write methods and credentials are rejected even for approved files', () => {
  const target = `/fonts/${fonts.assets[0].name}`;
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) assert.equal(catalogueFontRoute(fonts, method, target).status, 405);
  assert.equal(catalogueFontRoute(fonts, 'GET', target, true).status, 400);
});

test('font mapping rejects external, malformed and protected service origins', () => {
  for (const origin of ['https://fonts.gstatic.com', 'http://localhost:45000', 'http://127.0.0.1:45000/path',
    'http://127.0.0.1:45000/?x=1', 'http://127.0.0.1:3000', 'http://127.0.0.1:3100',
    'http://127.0.0.1:4000', 'http://127.0.0.1:4100', 'http://127.0.0.1:5432']) {
    assert.throws(() => catalogueFontStylesheets(fonts, origin));
  }
});

const runtimeParent = path.resolve(__dirname, '../../../.hotlap-e2e-runtime');
fs.mkdirSync(runtimeParent, { recursive: true });
const artifacts = fs.mkdtempSync(path.join(runtimeParent, 'font-contracts-'));
console.log(`HTTP font contract artifacts: ${artifacts}`);

async function ownedServer(t: TestContext) {
  const runtimeDir = fs.mkdtempSync(path.join(artifacts, 'server-'));
  const started = startCatalogueFontServer(fonts, runtimeDir);
  t.after(async () => {
    const server = await started;
    try { await server.stop(); }
    finally {
      fs.writeFileSync(path.join(runtimeDir, 'final-diagnostics.json'), JSON.stringify(server.diagnostics(), null, 2));
    }
    assert.equal(server.diagnostics().closed, true);
  });
  const server = await started;
  fs.writeFileSync(path.join(runtimeDir, 'ownership.json'), JSON.stringify({ purpose: 'HTTP font contract test', pid: process.pid, origin: server.origin }));
  assert.equal(new URL(server.origin).hostname, '127.0.0.1');
  return { server, runtimeDir };
}

function wire(origin: string, target: string, method = 'GET', headers: http.OutgoingHttpHeaders = {}, body?: string) {
  const url = new URL(origin);
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
    // Keep the TCP destination fixed. Raw traversal targets must reach the server unchanged.
    const request = http.request({ hostname: url.hostname, port: url.port, path: target, method, headers, agent: false }, response => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode!, headers: response.headers, body: Buffer.concat(chunks) }));
      response.on('error', reject);
      response.on('aborted', () => reject(new Error('Font contract response aborted')));
    });
    request.setTimeout(5000, () => request.destroy(new Error('Font contract request timed out')));
    request.on('error', reject);
    request.end(body);
  });
}

function controlledEmission(runtimeDir: string) {
  // Controlled readiness inputs, not a Next.js compilation or browser rendering assertion.
  const media = path.join(runtimeDir, 'web/.next/dev/static/media');
  fs.mkdirSync(media, { recursive: true });
  for (const asset of fonts.assets) fs.writeFileSync(path.join(media, asset.name), asset.data);
  fs.writeFileSync(path.join(runtimeDir, 'font-mock-evaluations.jsonl'), '{"scope":"controlled HTTP font contract fixture"}\n');
}

test('HTTP GET returns exact WOFF2 bytes/hashes and HEAD returns matching headers without a body', async t => {
  const { server, runtimeDir } = await ownedServer(t);
  controlledEmission(runtimeDir);
  for (const asset of fonts.assets) {
    const response = await wire(server.origin, `/fonts/${asset.name}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], 'font/woff2');
    assert.equal(response.headers['content-length'], String(asset.bytes));
    assert.deepEqual(response.body, asset.data);
    assert.equal(createHash('sha256').update(response.body).digest('hex'), asset.sha256);
  }
  const asset = fonts.assets[0];
  const head = await wire(server.origin, `/fonts/${asset.name}`, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.headers['content-type'], 'font/woff2');
  assert.equal(head.headers['content-length'], String(asset.bytes));
  assert.equal(head.body.length, 0);
  assert.deepEqual(server.diagnostics().errors, []);
  server.verifyReadiness();
});

test('HTTP rejects traversal, queries, writes and credentials; rejection errors invalidate otherwise valid readiness', async t => {
  const { server, runtimeDir } = await ownedServer(t);
  controlledEmission(runtimeDir);
  for (const asset of fonts.assets) assert.equal((await wire(server.origin, `/fonts/${asset.name}`)).status, 200);
  server.verifyReadiness();
  const target = `/fonts/${fonts.assets[0].name}`;
  for (const invalid of ['/', '/fonts/', '/fonts/../manifest.json', '/fonts/%2e%2e/licenses/rubik-OFL.txt',
    '/fonts/%2fetc%2fpasswd.woff2', '/fonts/missing.woff2', `${target}?v=1`, `${target}/extra`,
    `http://elsewhere.invalid${target}`]) {
    assert.equal((await wire(server.origin, invalid)).status, 404);
  }
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    const rejected = await wire(server.origin, target, method);
    assert.equal(rejected.status, 405);
    assert.equal(rejected.headers.allow, 'GET, HEAD');
  }
  for (const headers of [{ authorization: 'Bearer contract-only-secret' }, { cookie: 'session=contract-only-secret' }]) {
    assert.equal((await wire(server.origin, target, 'GET', headers)).status, 400);
  }
  assert.equal(server.diagnostics().errors.length, 16);
  assert.throws(() => server.verifyReadiness(), /Font listener errors/);
});

test('HTTP diagnostics bound request/error history and exclude raw paths, queries, credentials and bodies', async t => {
  const { server, runtimeDir } = await ownedServer(t);
  for (let i = 0; i < 110; i++) assert.equal((await wire(server.origin, `/unknown-${i}`)).status, 404);
  assert.equal((await wire(server.origin, '/fonts/path-secret.woff2?token=query-secret')).status, 404);
  const target = `/fonts/${fonts.assets[0].name}`;
  assert.equal((await wire(server.origin, target, 'GET', { authorization: 'Bearer auth-secret', cookie: 'session=cookie-secret' })).status, 400);
  assert.equal((await wire(server.origin, target, 'POST', { 'content-type': 'text/plain' }, 'body-secret')).status, 405);
  const diagnostics = server.diagnostics();
  assert.equal(diagnostics.totalRequests, 113);
  assert.equal(diagnostics.requests.length, 100);
  assert.equal(diagnostics.errors.length, 20);
  for (const entry of diagnostics.requests) {
    assert.equal(entry.path, '/<unsupported>');
    assert.deepEqual(Object.keys(entry).sort(), ['method', 'path', 'status', 'utc']);
  }
  const file = path.join(runtimeDir, 'font-requests.jsonl');
  const log = fs.readFileSync(file, 'utf8');
  assert.equal(log.trim().split('\n').length, 113);
  assert.ok(fs.statSync(file).size <= 1024 * 1024);
  const combined = JSON.stringify(diagnostics) + log;
  for (const secret of ['path-secret', 'query-secret', 'auth-secret', 'cookie-secret', 'body-secret']) {
    assert.equal(combined.includes(secret), false);
  }
  assert.throws(() => server.verifyReadiness(), /Font listener errors/);
});

test('HTTP listener closes, releases its assigned port and tolerates repeated/concurrent stop calls', async t => {
  const { server } = await ownedServer(t);
  const port = Number(new URL(server.origin).port);
  const closing = server.stop();
  assert.strictEqual(server.stop(), closing);
  await Promise.all([closing, server.stop()]);
  await server.stop();
  assert.equal(server.diagnostics().closed, true);
  await assert.rejects(wire(server.origin, `/fonts/${fonts.assets[0].name}`), { code: 'ECONNREFUSED' });
  const probe = net.createServer();
  t.after(async () => {
    if (probe.listening) await new Promise<void>((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    probe.once('error', reject); probe.listen(port, '127.0.0.1', resolve);
  });
  await new Promise<void>((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
});
