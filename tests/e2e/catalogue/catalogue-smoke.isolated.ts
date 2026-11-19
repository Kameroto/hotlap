import { test, expect } from './catalogue-test';

test('isolated catalogue renders the six fictional products and both categories', async ({ page, safety, catalogueSafety }, testInfo) => {
  expect(process.env.HOTLAP_CATALOGUE_RUNNER_DIR, 'Global setup supplied the runner diagnostic directory').toBeTruthy();
  await testInfo.attach('runner-diagnostics', {
    body: JSON.stringify({ runtimeDir: process.env.HOTLAP_CATALOGUE_RUNNER_DIR }), contentType: 'application/json',
  });
  const response = await page.goto('/products');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL('http://127.0.0.1:3100/products');
  for (const name of ['Alder', 'Birch', 'Cedar', 'Dune', 'Elm', 'Fir']) {
    await expect(page.getByRole('heading', { name: `E2E Catalogue ${name}`, exact: true })).toBeVisible();
  }
  for (const name of ['E2E Fixture Alpha', 'E2E Fixture Beta']) {
    await expect(page.getByRole('button', { name: `${name} (3)`, exact: true })).toBeVisible();
  }
  // Observe signed-out initialization, rather than ending before its requests settle.
  await expect.poll(() => safety.requests.some(request => request.disposition === 'mock-auth')).toBe(true);
  await expect.poll(() => safety.requests.some(request => request.disposition === 'mock-cart')).toBe(true);
  expect(catalogueSafety.unexpected).toEqual([]);
});
