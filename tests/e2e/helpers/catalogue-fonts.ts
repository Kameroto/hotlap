import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';

type Asset = { name: string; file: string; family: string; sha256: string; bytes: number };
type Font = { family: string; url: string; cssFile: string; cssSha256: string; variants: string[]; faces: number; latinFaces: number };
type Manifest = {
  formatVersion: number; nextVersion: string; assets: Asset[]; fonts: Font[];
  licenses: Array<{ family: string; file: string; sha256: string; url: string }>;
};
export type CatalogueFonts = {
  nextVersion: string;
  assets: Array<Asset & { data: Buffer }>;
  stylesheets: Record<string, string>;
};
const fixtureDir = path.resolve(__dirname, '../fixtures/fonts');
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const assetName = /^[A-Za-z0-9_.-]+\.woff2$/;

function installedStylesheetUrls() {
  const resolve = createRequire(path.resolve(__dirname, '../../../apps/web/package.json'));
  const version = (resolve('next/package.json') as { version: string }).version;
  assert.equal(version, '16.2.12', 'Review the internal font mock contract before changing Next.js');
  const base = 'next/dist/compiled/@next/font/dist/google/';
  const { validateGoogleFontFunctionCall: validate } = resolve(`${base}validate-google-font-function-call`) as {
    validateGoogleFontFunctionCall(name: string, options: unknown): {
      fontFamily: string; weights: string[]; styles: string[]; axes?: string[]; display: string;
    };
  };
  const { getFontAxes } = resolve(`${base}get-font-axes`) as {
    getFontAxes(family: string, weights: string[], styles: string[], axes?: string[]): unknown;
  };
  const { getGoogleFontsUrl } = resolve(`${base}get-google-fonts-url`) as {
    getGoogleFontsUrl(family: string, axes: unknown, display: string): string;
  };
  const calls = [
    ['Rubik', { weight: ['400', '500', '600'], subsets: ['latin'], variable: '--font-rubik' }],
    ['Tomorrow', { weight: '700', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-tomorrow' }],
    ['Geist_Mono', { subsets: ['latin'], variable: '--font-geist-mono' }],
  ] as const;
  return calls.map(([name, args]) => {
    const options = validate(name, args);
    return getGoogleFontsUrl(options.fontFamily,
      getFontAxes(options.fontFamily, options.weights, options.styles, options.axes), options.display);
  });
}

/** Offline, fail-closed integrity and contract checks; no ignored runtime inputs. */
export function loadCatalogueFonts(): CatalogueFonts {
  const manifest = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'manifest.json'), 'utf8')) as Manifest;
  assert.equal(manifest.formatVersion, 1); assert.equal(manifest.nextVersion, '16.2.12');
  assert.equal(manifest.assets.length, 16); assert.equal(new Set(manifest.assets.map(a => a.name)).size, 16);
  assert.deepEqual(fs.readdirSync(path.join(fixtureDir, 'assets')).sort(), manifest.assets.map(a => a.name).sort());
  assert.deepEqual(manifest.fonts.map(f => f.url).sort(), installedStylesheetUrls().sort());
  const assets = manifest.assets.map(asset => {
    assert.match(asset.name, assetName); assert.equal(asset.file, `assets/${asset.name}`);
    const data = fs.readFileSync(path.join(fixtureDir, asset.file));
    assert.equal(data.length, asset.bytes); assert.equal(digest(data), asset.sha256, `Font hash mismatch: ${asset.name}`);
    assert.equal(data.subarray(0, 4).toString(), 'wOF2'); assert.equal(data.readUInt32BE(8), data.length);
    return { ...asset, data };
  });
  assert.equal(manifest.licenses.length, 3);
  for (const license of manifest.licenses) {
    assert.match(license.file, /^licenses\/[a-z-]+-OFL\.txt$/);
    const data = fs.readFileSync(path.join(fixtureDir, license.file));
    assert.equal(digest(data), license.sha256, `License hash mismatch: ${license.family}`);
    assert.ok(data.toString().includes('SIL OPEN FONT LICENSE Version 1.1'));
  }
  const referenced = new Set<string>(); const stylesheets: Record<string, string> = {};
  for (const font of manifest.fonts) {
    assert.match(font.cssFile, /^[a-z-]+\.css$/);
    const data = fs.readFileSync(path.join(fixtureDir, font.cssFile));
    assert.equal(digest(data), font.cssSha256, `Stylesheet hash mismatch: ${font.family}`);
    const css = data.toString();
    const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map(match => match[1]);
    assert.equal(urls.length, font.faces);
    for (const url of urls) {
      const name = url.replace('__FONT_ORIGIN__/fonts/', '');
      assert.equal(url, `__FONT_ORIGIN__/fonts/${name}`); assert.match(name, assetName);
      assert.ok(assets.some(asset => asset.name === name && asset.family === font.family)); referenced.add(name);
    }
    assert.equal((css.match(/\/\* latin \*\//g) ?? []).length, font.latinFaces);
    assert.ok(css.includes(`font-family: '${font.family}';`)); stylesheets[font.url] = css;
  }
  assert.equal(referenced.size, assets.length, 'Do not bundle unused font files');
  return { nextVersion: manifest.nextVersion, assets, stylesheets };
}

export function catalogueFontStylesheets(fonts: CatalogueFonts, origin: string): Record<string, string> {
  const url = new URL(origin);
  assert.equal(url.origin, origin); assert.equal(url.protocol, 'http:'); assert.equal(url.hostname, '127.0.0.1');
  assert.ok(url.port && ![3000, 3100, 4000, 4100, 5432].includes(Number(url.port)));
  return Object.fromEntries(Object.entries(fonts.stylesheets).map(([key, css]) => [key, css.replaceAll('__FONT_ORIGIN__', origin)]));
}

export function writeCatalogueFontMock(fonts: CatalogueFonts, origin: string, runtimeDir: string): string {
  const stylesheets = catalogueFontStylesheets(fonts, origin);
  const file = path.join(runtimeDir, 'font-responses.cjs');
  const marker = path.join(runtimeDir, 'font-mock-evaluations.jsonl');
  fs.writeFileSync(file, `const fs = require('node:fs');\nconst data = ${JSON.stringify(stylesheets)};\n` +
    `const marker = ${JSON.stringify(marker)};\n` +
    `if (!fs.existsSync(marker) || fs.statSync(marker).size < 65536) fs.appendFileSync(marker, JSON.stringify({utc:new Date().toISOString(),pid:process.pid,keys:Object.keys(data)})+'\\n');\n` +
    'module.exports = data;\n');
  return file;
}

/** Raw target matching deliberately rejects queries, escaped paths and traversal. */
export function catalogueFontRoute(fonts: CatalogueFonts, method: string, target: string, hasCredentials = false) {
  if (!['GET', 'HEAD'].includes(method)) return { status: 405 };
  if (hasCredentials) return { status: 400 };
  const match = /^\/fonts\/([A-Za-z0-9_.-]+\.woff2)$/.exec(target);
  const name = match?.[1];
  return name && fonts.assets.some(asset => asset.name === name) ? { status: 200, name } : { status: 404 };
}

export async function startCatalogueFontServer(fonts: CatalogueFonts, runtimeDir: string) {
  type Request = { utc: string; method: string; path: string; status: number; sha256?: string };
  const requests: Request[] = []; const errors: string[] = []; const served = new Set<string>();
  const assets = new Map(fonts.assets.map(asset => [asset.name, asset]));
  let logBytes = 0; let totalRequests = 0;
  const recordError = (error: unknown) => { if (errors.length < 20) errors.push(String(error)); };
  const server = http.createServer((request, response) => {
    const method = request.method ?? 'UNKNOWN';
    const route = catalogueFontRoute(fonts, method, request.url ?? '', !!(request.headers.cookie || request.headers.authorization));
    const asset = route.name ? assets.get(route.name) : undefined;
    const entry = { utc: new Date().toISOString(), method, path: asset ? `/fonts/${asset.name}` : '/<unsupported>',
      status: route.status, ...(asset ? { sha256: asset.sha256 } : {}) };
    totalRequests++; requests.push(entry); if (requests.length > 100) requests.shift();
    if (route.status === 200 && method === 'GET' && asset) served.add(asset.name);
    if (route.status !== 200) recordError(`Unsupported font request: ${method} (${route.status})`);
    try {
      const line = `${JSON.stringify(entry)}\n`;
      if (logBytes + Buffer.byteLength(line) <= 1024 * 1024) {
        fs.appendFileSync(path.join(runtimeDir, 'font-requests.jsonl'), line); logBytes += Buffer.byteLength(line);
      }
    } catch (error) { recordError(error); }
    request.resume();
    if (!asset || route.status !== 200) {
      response.writeHead(route.status, { 'content-type': 'text/plain', ...(route.status === 405 ? { allow: 'GET, HEAD' } : {}) });
      response.end('Unsupported font fixture request'); return;
    }
    response.writeHead(200, { 'content-type': 'font/woff2', 'content-length': asset.data.length, 'cache-control': 'no-store' });
    response.end(method === 'HEAD' ? undefined : asset.data);
  });
  server.on('error', recordError);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { server.off('error', reject); resolve(); });
  });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const origin = `http://127.0.0.1:${address.port}`;
  let closing: Promise<void> | undefined;
  const diagnostics = () => ({ origin, closed: !server.listening, totalRequests, servedAssets: [...served], requests: [...requests], errors: [...errors] });
  return {
    origin, diagnostics,
    verifyReadiness() {
      assert.deepEqual(errors, [], 'Font listener errors');
      for (const asset of fonts.assets) assert.ok(served.has(asset.name), `Font was not fetched: ${asset.name}`);
      const media = path.join(runtimeDir, 'web/.next/dev/static/media');
      const emitted = new Set(fs.readdirSync(media).filter(name => name.endsWith('.woff2')).map(name => digest(fs.readFileSync(path.join(media, name)))));
      for (const asset of fonts.assets) assert.ok(emitted.has(asset.sha256), `Font was not emitted intact: ${asset.name}`);
      const marker = fs.readFileSync(path.join(runtimeDir, 'font-mock-evaluations.jsonl'), 'utf8');
      assert.ok(marker.trim(), 'Font mock was not evaluated');
      const stderr = path.join(runtimeDir, 'next-stderr.log');
      if (fs.existsSync(stderr)) assert.doesNotMatch(fs.readFileSync(stderr, 'utf8'), /queries (?:must )?have exactly one entry|Failed to (?:download|fetch)|Can't resolve '@vercel\/turbopack-next\/internal\/font/);
    },
    stop() {
      closing ??= new Promise<void>((resolve, reject) => {
        if (!server.listening) { server.closeAllConnections(); resolve(); return; }
        server.close(error => error ? reject(error) : resolve()); server.closeAllConnections();
      });
      return closing;
    },
  };
}
