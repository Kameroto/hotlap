import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// Workers inherit this value instead of independently choosing output directories.
const runtimeRoot = path.resolve(__dirname, '../../../.hotlap-e2e-runtime');
const outputRoot = process.env.HOTLAP_CATALOGUE_PLAYWRIGHT_OUTPUT ??=
  path.join(runtimeRoot, `playwright-catalogue-${randomUUID()}`);
assert.equal(path.dirname(outputRoot), runtimeRoot, 'Outputs must remain under the ignored runtime root');
assert.match(path.basename(outputRoot), /^playwright-catalogue-[a-f0-9-]+$/, 'Outputs must not overlap staged catalogue runtimes');

export default defineConfig({
  testDir: __dirname,
  testMatch: '**/*.isolated.ts',
  globalSetup: require.resolve('./global-setup'),
  globalTimeout: 0, // Runner deadlines bound startup; do not exhaust a shared teardown deadline.
  outputDir: path.join(outputRoot, 'results'),
  fullyParallel: false,
  forbidOnly: true,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 7500 },
  reporter: [['list'], ['html', { outputFolder: path.join(outputRoot, 'report'), open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },
  projects: [{ name: 'catalogue-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
});
