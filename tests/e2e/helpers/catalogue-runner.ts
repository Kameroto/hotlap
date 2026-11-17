import assert from 'node:assert/strict';
import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { startCatalogueFixture } from '../fixtures/catalogue-api';
import { catalogueCategories, catalogueProducts } from '../fixtures/catalogue-data';
import { loadCatalogueFonts, startCatalogueFontServer, writeCatalogueFontMock } from './catalogue-fonts';

const root = path.resolve(__dirname, '../../..');
const source = path.join(root, 'apps/web');
const directories = ['app', 'components', 'hooks', 'lib', 'store', 'types', 'public'];
const configuration = ['package.json', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs'];
const MAX_LOG = 2 * 1024 * 1024;
type Identity = { pid: number; ppid: number; start: string; name: string };
type Services = Array<{ port: number; listening: boolean; identities: Identity[] }>;
type Journal = { requests: Array<{ sequence: number; method: string; path: string; status: number; query: Record<string, string> }> };

function identity(pid: number): Identity | undefined {
  try {
    const raw = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
    const end = raw.lastIndexOf(') '); const fields = raw.slice(end + 2).split(' ');
    if (fields[0] === 'Z') return;
    return { pid, ppid: Number(fields[1]), start: fields[19], name: raw.slice(raw.indexOf('(') + 1, end) };
  } catch (error) {
    if (['ENOENT', 'ESRCH'].includes((error as NodeJS.ErrnoException).code ?? '')) return;
    throw error;
  }
}

function services(): Services {
  const lines = execFileSync('ss', ['-ltn', '-p'], { encoding: 'utf8', maxBuffer: MAX_LOG }).split('\n');
  return [3000, 4000, 5432].map(port => {
    const matching = lines.filter(line => line.trim().split(/\s+/)[3]?.endsWith(`:${port}`));
    const pids = new Set(matching.flatMap(line => [...line.matchAll(/pid=(\d+)/g)].map(match => Number(match[1]))));
    return { port, listening: matching.length > 0, identities: [...pids].flatMap(pid => identity(pid) ?? []) };
  });
}

async function vacant(port: number) {
  const listener = net.createServer();
  await new Promise<void>((resolve, reject) => {
    listener.once('error', reject);
    listener.listen(port, '127.0.0.1', () => listener.close(error => error ? reject(error) : resolve()));
  });
}

// Reject source symlinks; the only staged link is the explicit dependency link.
function inputs(): Record<string, string> {
  const hashes: Record<string, string> = {};
  function walk(file: string) {
    const name = path.basename(file);
    if (name.startsWith('.env') || ['.next', '.turbo', 'node_modules', '.git'].includes(name) || name.endsWith('.tsbuildinfo')) return;
    const stat = fs.lstatSync(file);
    assert.ok(!stat.isSymbolicLink(), `Source symlink is unsupported: ${file}`);
    if (stat.isDirectory()) for (const entry of fs.readdirSync(file)) walk(path.join(file, entry));
    else if (stat.isFile()) hashes[path.relative(source, file)] = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
  for (const name of [...directories, ...configuration]) walk(path.join(source, name));
  // This ignored generated input may be absent in a fresh clone.
  if (fs.existsSync(path.join(source, 'next-env.d.ts'))) walk(path.join(source, 'next-env.d.ts'));
  return hashes;
}

function dependencyLinks(): Record<string, string> {
  const links: Record<string, string> = {};
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) links[path.relative(source, file)] = fs.readlinkSync(file);
      else if (entry.isDirectory()) walk(file);
    }
  }
  walk(path.join(source, 'node_modules')); return links;
}

function timeout(value: number | undefined): number {
  const result = value ?? Number(process.env.HOTLAP_CATALOGUE_READY_TIMEOUT_MS ?? 240000);
  assert.ok(Number.isInteger(result) && result >= 1000 && result <= 240000,
    'Cold readiness timeout must be an integer between 1000 and 240000 milliseconds');
  return result;
}

/** Linux/WSL foundation: cold-validates the catalogue before returning a live handle. */
export async function startCatalogueRunner(options: { coldTimeoutMs?: number } = {}) {
  assert.equal(process.platform, 'linux', 'Catalogue process ownership requires Linux /proc');
  const coldTimeoutMs = timeout(options.coldTimeoutMs);
  const beforeServices = services();
  await vacant(3100); await vacant(4100); // Occupied ports fail before any staging/startup.
  const fonts = loadCatalogueFonts(); // All font/CSS/license hashes checked before any listener starts.
  const beforeInputs = inputs(); const beforeLinks = dependencyLinks();
  const parent = path.join(root, '.hotlap-e2e-runtime'); fs.mkdirSync(parent, { recursive: true });
  const runtimeDir = fs.mkdtempSync(path.join(parent, 'catalogue-'));
  const web = path.join(runtimeDir, 'web'); fs.mkdirSync(web); fs.mkdirSync(path.join(runtimeDir, 'owned'));
  const started = process.hrtime.bigint();
  const stamp = () => ({ utc: new Date().toISOString(), elapsedMs: Number(process.hrtime.bigint() - started) / 1e6 });
  const milestones: Record<string, unknown> = {};
  const diagnostics: Record<string, unknown> = { runtimeDir, coldTimeoutMs, milestones, beforeServices, readiness: 'pending' };
  const save = () => fs.writeFileSync(path.join(runtimeDir, 'report.json'), JSON.stringify(diagnostics, null, 2));
  const sizes = new Map<string, number>();
  let shutdownErrors: string[] | undefined;
  function log(name: string, value: string) {
    const size = sizes.get(name) ?? 0; if (size >= MAX_LOG) return;
    const chunk = Buffer.from(value).subarray(0, MAX_LOG - size);
    try { fs.appendFileSync(path.join(runtimeDir, name), chunk); sizes.set(name, size + chunk.length); }
    catch (error) {
      if (!shutdownErrors) throw error;
      shutdownErrors.push(`Diagnostic log ${name}: ${String(error)}`);
    }
  }
  function event(kind: string, data: Record<string, unknown> = {}) {
    const entry = { ...stamp(), kind, ...data }; log('timeline.jsonl', `${JSON.stringify(entry)}\n`);
    if (!['http-chunk', 'owned-observed'].includes(kind)) milestones[kind] = entry;
  }
  const abort = new AbortController();
  let fixture: Awaited<ReturnType<typeof startCatalogueFixture>> | undefined;
  let fontServer: Awaited<ReturnType<typeof startCatalogueFontServer>> | undefined;
  let child: ChildProcess | undefined;
  let monitor: ReturnType<typeof setInterval> | undefined;
  let polling: ReturnType<typeof setInterval> | undefined;
  let pendingJournal: Promise<Journal | undefined> | undefined;
  let stopping: Promise<void> | undefined;
  let published = false;
  let baseline = 0;
  const owned = new Map<string, Identity>();
  function observe() {
    for (const file of fs.readdirSync(path.join(runtimeDir, 'owned'))) {
      if (!file.endsWith('.json')) continue;
      const record = JSON.parse(fs.readFileSync(path.join(runtimeDir, 'owned', file), 'utf8')) as Identity & { run: string };
      if (record.run === runtimeDir) owned.set(`${record.pid}:${record.start}`, record);
    }
    const processes = fs.readdirSync('/proc').filter(name => /^\d+$/.test(name)).flatMap(name => identity(Number(name)) ?? []);
    const ids = new Set([...owned.values()].filter(p => identity(p.pid)?.start === p.start).map(p => p.pid));
    let changed = true;
    while (changed) {
      changed = false;
      for (const p of processes) if (ids.has(p.ppid) && !ids.has(p.pid)) {
        ids.add(p.pid); owned.set(`${p.pid}:${p.start}`, p); changed = true;
      }
    }
  }
  function check() {
    if (fs.existsSync(path.join(runtimeDir, 'blocked-connections.jsonl'))) abort.abort(new Error('Protected development-port connection blocked'));
    abort.signal.throwIfAborted();
  }
  async function journal(label: string): Promise<Journal | undefined> {
    if (!fixture) return;
    try {
      const response = await fetch(`${fixture.url}/__fixture/requests`, { signal: AbortSignal.timeout(5000) });
      assert.equal(response.status, 200);
      const body = await response.json() as Journal;
      log('fixture-journal.jsonl', `${JSON.stringify({ ...stamp(), label, ...body })}\n`); return body;
    } catch (error) { event('journal-error', { label, message: String(error) }); }
  }
  function signalOwned(p: Identity, signal: NodeJS.Signals) {
    if (identity(p.pid)?.start !== p.start) return;
    event('owned-signal', { pid: p.pid, start: p.start, signal });
    try { process.kill(p.pid, signal); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error;
    }
  }
  function stop(): Promise<void> {
    if (stopping) return stopping;
    stopping = (async () => {
      const errors = shutdownErrors ??= [];
      event('shutdown-start');
      if (!abort.signal.aborted) abort.abort(new Error('Catalogue runner stopping'));
      if (polling) clearInterval(polling);
      try {
        if (pendingJournal && !await pendingJournal) errors.push('Pending fixture journal unavailable');
      } catch (error) { errors.push(`Pending fixture journal: ${String(error)}`); }
      const captureJournal = async (label: string) => {
        try {
          const captured = await journal(label);
          if (fixture && !captured) errors.push(`Fixture journal unavailable: ${label}`);
          return captured;
        } catch (error) { errors.push(`Fixture journal (${label}): ${String(error)}`); }
      };
      await captureJournal('pre-shutdown');
      const discoveryErrors: Array<{ phase: string; message: string }> = [];
      const discover = (phase: string) => {
        try { observe(); } catch (error) {
          discoveryErrors.push({ phase, message: String(error) });
          errors.push(`Process discovery (${phase}): ${String(error)}`);
        }
      };
      const terminate = (p: Identity, signal: NodeJS.Signals) => {
        try { signalOwned(p, signal); } catch (error) {
          errors.push(`Process ${p.pid}:${p.start} ${signal}: ${String(error)}`);
        }
      };
      discover('initial');
      const cli = [...owned.values()].find(p => p.pid === child?.pid);
      if (cli) terminate(cli, 'SIGTERM');
      const deadline = Date.now() + 7000;
      while (cli && Date.now() < deadline) {
        try { if (identity(cli.pid)?.start !== cli.start) break; } catch (error) {
          errors.push(`CLI identity ${cli.pid}:${cli.start}: ${String(error)}`);
          await delay(Math.max(0, deadline - Date.now())); break;
        }
        discover('grace-period'); await delay(100);
      }
      discover('before-sigterm'); for (const p of owned.values()) terminate(p, 'SIGTERM');
      await delay(1000); discover('before-sigkill'); for (const p of owned.values()) terminate(p, 'SIGKILL');
      await delay(500); discover('final');
      const remaining: Identity[] = [];
      const unverified: Identity[] = [];
      for (const p of owned.values()) {
        try { if (identity(p.pid)?.start === p.start) remaining.push(p); } catch (error) {
          unverified.push(p); errors.push(`Final identity ${p.pid}:${p.start}: ${String(error)}`);
        }
      }
      diagnostics.processDiscoveryErrors = discoveryErrors;
      diagnostics.remainingOwnedProcesses = remaining;
      diagnostics.unverifiedOwnedProcesses = unverified;
      if (remaining.length) errors.push('Owned processes remain; inspect report identities');
      if (monitor) clearInterval(monitor);
      diagnostics.finalJournal = await captureJournal('before-fixture-close');
      try {
        if (fontServer) {
          await fontServer.stop(); diagnostics.fonts = fontServer.diagnostics();
          assert.ok(fontServer.diagnostics().closed, 'Font listener remains open');
          assert.deepEqual(fontServer.diagnostics().errors, [], 'Font listener reported errors');
          event('font-listener-closed');
        }
      } catch (error) { errors.push(`Font cleanup: ${String(error)}`); }
      try { await fixture?.close(); event('fixture-closed'); } catch (error) { errors.push(`Fixture cleanup: ${String(error)}`); }
      const released: number[] = [];
      for (const port of [3100, 4100]) try { await vacant(port); released.push(port); } catch { errors.push(`Port ${port} is still occupied`); }
      diagnostics.releasedTestPorts = released;
      try {
        assert.deepEqual(inputs(), beforeInputs); assert.deepEqual(dependencyLinks(), beforeLinks);
        diagnostics.originalInputsUnchanged = true;
        const after = services(); diagnostics.afterServices = after;
        for (const service of beforeServices) {
          const current = after.find(item => item.port === service.port)!;
          if (service.listening) assert.ok(current.listening, `Existing port ${service.port} stopped listening`);
          for (const p of service.identities) assert.ok(current.identities.some(item => item.pid === p.pid && item.start === p.start), `Existing service identity changed on ${service.port}`);
        }
      } catch (error) { errors.push(`Preservation check: ${String(error)}`); }
      diagnostics.cleanupErrors = errors; diagnostics.logBytes = Object.fromEntries(sizes);
      event('shutdown-complete', { errors });
      try { save(); } catch (error) { errors.push(`Cleanup report: ${String(error)}`); }
      process.off('SIGINT', onSignal); process.off('SIGTERM', onSignal);
      if (errors.length) throw new Error(`Catalogue cleanup failed: ${errors.join('; ')} (${runtimeDir})`);
    })();
    return stopping;
  }
  function onSignal(signal: NodeJS.Signals) {
    abort.abort(new Error(`Received ${signal}`));
    if (published) void stop().catch(error => { console.error(error); process.exitCode = 1; });
  }
  process.on('SIGINT', onSignal); process.on('SIGTERM', onSignal);
  try {
    event('staging-start'); save();
    for (const name of Object.keys(beforeInputs)) {
      const target = path.join(web, name); fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(source, name), target);
    }
    if (!fs.existsSync(path.join(web, 'next-env.d.ts'))) {
      fs.writeFileSync(path.join(web, 'next-env.d.ts'), '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n');
    }
    fs.symlinkSync(path.join(source, 'node_modules'), path.join(web, 'node_modules'), 'dir');
    const resolver = createRequire(path.join(web, 'package.json'));
    diagnostics.dependencies = ['next', 'react', 'react-dom', '@tailwindcss/postcss', 'typescript', 'babel-plugin-react-compiler']
      .map(name => ({ name, target: fs.realpathSync(resolver.resolve(name)) }));
    check();
    fontServer = await startCatalogueFontServer(fonts, runtimeDir); check();
    const fontMockFile = writeCatalogueFontMock(fonts, fontServer.origin, runtimeDir);
    diagnostics.fonts = fontServer.diagnostics(); diagnostics.fontMockFile = fontMockFile;
    event('font-listener-ready', { origin: fontServer.origin, verifiedAssets: fonts.assets.length });
    fixture = await startCatalogueFixture(4100); check();
    const health = await fetch(`${fixture.url}/__fixture/health`, { signal: AbortSignal.timeout(5000) });
    assert.equal(health.status, 200);
    const healthBody = await health.json() as { fixture: string; readOnly: boolean };
    assert.equal(healthBody.fixture, 'hotlap-catalogue'); assert.equal(healthBody.readOnly, true);
    diagnostics.fixtureHealth = healthBody;
    const firstJournal = await journal('pre-next'); assert.ok(firstJournal); baseline = firstJournal.requests.at(-1)?.sequence ?? 0;
    event('fixture-ready');
    let ready = false; let tail = '';
    const args = [resolver.resolve('next/dist/bin/next'), 'dev', web, '--hostname', '127.0.0.1', '--port', '3100'];
    child = spawn(process.execPath, args, { cwd: web, stdio: ['ignore', 'pipe', 'pipe'], env: {
      PATH: process.env.PATH, HOME: process.env.HOME, LANG: 'C.UTF-8', NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4100/api/v1', NEXT_TELEMETRY_DISABLED: '1',
      NEXT_FONT_GOOGLE_MOCKED_RESPONSES: fontMockFile,
      NEXT_EXIT_TIMEOUT_MS: '5000', HOTLAP_E2E_RUN_DIR: runtimeDir,
      NODE_OPTIONS: `--require=${JSON.stringify(path.join(__dirname, 'catalogue-process-guard.cjs'))}`,
    } });
    const cli = child.pid && identity(child.pid); if (cli) owned.set(`${cli.pid}:${cli.start}`, cli);
    diagnostics.launch = { pid: child.pid, executable: process.execPath, args, apiUrl: 'http://127.0.0.1:4100/api/v1' };
    child.on('error', error => abort.abort(error));
    child.on('exit', (code, signal) => { event('next-exit', { code, signal }); if (!stopping) abort.abort(new Error(`Next exited: ${code ?? signal}`)); });
    for (const [stream, name] of [[child.stdout!, 'next-stdout.log'], [child.stderr!, 'next-stderr.log']] as const) {
      stream.on('data', (chunk: Buffer) => {
        log(name, chunk.toString()); tail = (tail + chunk.toString()).slice(-8192);
        if (!ready && /Ready in/.test(tail)) { ready = true; event('next-ready'); }
      });
    }
    event('next-spawn'); save();
    monitor = setInterval(() => {
      try { observe(); check(); } catch (error) {
        abort.abort(error); if (published) void stop().catch(failure => { console.error(failure); process.exitCode = 1; });
      }
    }, 1000);
    polling = setInterval(() => { if (!pendingJournal) pendingJournal = journal('periodic').finally(() => { pendingJournal = undefined; }); }, 5000);
    const bootDeadline = Date.now() + 60000;
    while (!ready && Date.now() < bootDeadline) { check(); await delay(100); }
    check(); assert.ok(ready, 'Next startup did not become ready within 60 seconds');
    const htmlFile = fs.openSync(path.join(runtimeDir, 'response-sample.html'), 'w');
    let bytes = 0; let sampled = 0; let chunks = 0;
    const deadline = setTimeout(() => { event('readiness-timeout'); abort.abort(new Error(`Catalogue cold readiness exceeded ${coldTimeoutMs}ms`)); }, coldTimeoutMs);
    try {
      event('http-start', { path: '/products' });
      await new Promise<void>((resolve, reject) => {
        const request = http.get('http://127.0.0.1:3100/products', { signal: abort.signal }, response => {
          diagnostics.httpStatus = response.statusCode;
          event('http-headers', { status: response.statusCode, contentType: response.headers['content-type'] });
          response.on('data', (chunk: Buffer) => {
            bytes += chunk.length; chunks++;
            event(chunks === 1 ? 'http-first-chunk' : 'http-chunk', { length: chunk.length, bytes });
            if (sampled < MAX_LOG) { const sample = chunk.subarray(0, MAX_LOG - sampled); fs.writeSync(htmlFile, sample); sampled += sample.length; }
            if (bytes > 8 * 1024 * 1024) abort.abort(new Error('Catalogue response exceeds 8 MiB safety limit'));
          });
          response.on('end', () => { event('http-complete', { bytes, chunks }); resolve(); });
          response.on('error', reject); response.on('aborted', () => reject(new Error('Catalogue response aborted')));
        });
        request.on('error', reject);
      });
    } finally { clearTimeout(deadline); fs.closeSync(htmlFile); diagnostics.response = { bytes, chunks, sampled }; }
    check(); assert.equal(diagnostics.httpStatus, 200, 'Catalogue returned a non-200 response');
    const html = fs.readFileSync(path.join(runtimeDir, 'response-sample.html'), 'utf8');
    for (const product of catalogueProducts) assert.ok(html.includes(product.name), `Missing fictional product: ${product.name}`);
    for (const category of catalogueCategories.categories) assert.ok(html.includes(category.name), `Missing fictional category: ${category.name}`);
    diagnostics.verifiedProducts = catalogueProducts.map(product => product.name);
    diagnostics.verifiedCategories = catalogueCategories.categories.map(category => category.name);
    const reads = await journal('readiness'); assert.ok(reads, 'Fixture request evidence unavailable');
    diagnostics.serverReads = reads.requests.filter(item => item.sequence > baseline && item.path.startsWith('/api/v1/'));
    for (const route of ['/api/v1/categories', '/api/v1/products']) assert.ok(reads.requests.some(item => item.sequence > baseline && item.path === route && item.method === 'GET' && item.status === 200), `Missing server-side fixture read: ${route}`);
    assert.ok(reads.requests.every(item => item.method === 'GET' && item.status === 200), 'Unexpected fixture request');
    fontServer.verifyReadiness(); diagnostics.fonts = fontServer.diagnostics();
    check(); diagnostics.readiness = 'passed'; event('catalogue-ready'); save(); published = true;
    return { baseURL: 'http://127.0.0.1:3100', runtimeDir, stop };
  } catch (error) {
    shutdownErrors ??= [];
    diagnostics.readiness = 'failed'; diagnostics.failure = String(error); event('failure', { message: String(error) });
    try { save(); } catch (reportError) { shutdownErrors.push(`Startup failure report: ${String(reportError)}`); }
    try { await stop(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], `Catalogue startup and cleanup failed (${runtimeDir})`); }
    throw new Error(`Catalogue startup failed (${runtimeDir}): ${String(error)}`);
  }
}

if (require.main === module) {
  void (async () => {
    const runner = await startCatalogueRunner();
    try { console.log(`Catalogue ready: ${runner.baseURL}\nDiagnostics: ${runner.runtimeDir}`); }
    finally { await runner.stop(); }
    console.log('Catalogue smoke passed; owned processes and ports released.');
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
