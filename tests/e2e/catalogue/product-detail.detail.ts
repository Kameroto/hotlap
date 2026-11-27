import type { Locator, Page } from '@playwright/test';
import { detailSlug, missingDetailSlug, slowDetailSlug, unavailableDetailSlug } from '../fixtures/catalogue-detail-data';
import { measureOverflow } from '../helpers/overflow';
import { test, expect } from './catalogue-test';

test.use({ detailCartOptions: {} });
test.describe.configure({ timeout: 60_000 });
const name = 'E2E Detail Discount';
const productId = '00000000-0000-4000-8000-000000000701';

async function openProduct(page: Page, slug = detailSlug) {
  await page.goto(`/products/${slug}`);
}

function purchase(page: Page) {
  return page.getByRole('region', { name: 'Product purchase' });
}

function addButton(panel: Locator, productName = name) {
  return panel.getByRole('button', { name: `Add ${productName} to cart`, exact: true });
}

function mobilePurchase(page: Page) {
  return page.getByRole('complementary', { name: 'Mobile purchase controls' });
}

test('renders the product identity, price, specifications and other products in its category', async ({ page, catalogueSafety }) => {
  await openProduct(page);
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page).toHaveTitle(/E2E Detail Discount/);
  await expect(main.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('E2E Fixture Alpha');
  await expect(main.getByText('E2E Detail Brand', { exact: true }).first()).toBeVisible();
  await expect(main.getByText(/E2E-DETAIL-1/).first()).toBeVisible();
  await expect(main.getByText('Fictional detail description for isolated browser coverage.')).toBeVisible();
  await expect(main.getByRole('definition').filter({ hasText: 'Synthetic brushless' })).toBeVisible();
  await expect(main.getByLabel('3.2 out of 5 stars').first()).toBeVisible();
  await expect(main.getByText(/11 reviews/).first()).toBeVisible();
  await expect(purchase(page)).toContainText('₹300');
  await expect(purchase(page)).toContainText('₹450');
  await expect(purchase(page)).toContainText('33%');
  await expect(purchase(page).getByText('In Stock', { exact: true })).toBeVisible();
  await expect(main.getByRole('link', { name: 'E2E Detail Sold Out' }).first()).toBeVisible();
  await expect(main.getByRole('link', { name, exact: true })).toHaveCount(0);
  await expect(main.getByRole('heading', { level: 3, name: /^E2E Detail/ })).toHaveText([
    'E2E Detail Sold Out', 'E2E Detail Loading', 'E2E Detail Low Stock', 'E2E Detail Single Image',
  ]);
  await expect.poll(() => catalogueSafety.decisions.map(entry => entry.decision)).toEqual(
    expect.arrayContaining(['mock-detail-auth', 'mock-detail-cart']),
  );
});

test('selects the primary image and cycles through the ordered gallery', async ({ page }) => {
  await openProduct(page);
  const opener = page.getByRole('button', { name: `Open image gallery for ${name}` });
  const side = page.getByRole('button', { name: 'Show product image 2' });
  const primary = page.getByRole('button', { name: 'Show product image 1' });
  await expect(opener.getByRole('img', { name: 'Fictional primary angle' })).toBeVisible();
  await expect(primary).toHaveAttribute('aria-pressed', 'true');
  await side.press('Enter');
  await expect(side).toHaveAttribute('aria-pressed', 'true');
  await expect(opener.getByRole('img', { name: 'Fictional side angle' })).toBeVisible();
  await page.getByRole('button', { name: 'Previous product image' }).click();
  await expect(primary).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Previous product image' }).click();
  await expect(opener.getByRole('img', { name: 'Fictional rear angle' })).toBeVisible();
  await page.getByRole('button', { name: 'Next product image' }).click();
  await expect(primary).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Next product image' }).click();
  await expect(side).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Next product image' }).click();
  await expect(opener.getByRole('img', { name: 'Fictional rear angle' })).toBeVisible();
});

for (const action of ['Open', 'Expand']) {
  test(`lightbox contains keyboard focus and restores the ${action} opener`, async ({ page }) => {
    await openProduct(page);
    const opener = page.getByRole('button', { name: `${action} image gallery for ${name}` });
    await opener.press('Enter');
    const dialog = page.getByRole('dialog', { name: `${name} image gallery` });
    const close = dialog.getByRole('button', { name: 'Close image gallery' });
    await expect(dialog).toBeVisible();
    await expect(close).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await close.press('ArrowRight');
    await expect(dialog.getByRole('img', { name: 'Fictional side angle' })).toBeVisible();
    await close.press('ArrowLeft');
    await expect(dialog.getByRole('img', { name: 'Fictional primary angle' })).toBeVisible();
    for (const key of ['Shift+Tab', 'Tab']) {
      await page.keyboard.press(key);
      const focus = await dialog.evaluate(node => ({
        inside: node.contains(document.activeElement),
        browserChrome: !document.hasFocus() && document.activeElement === document.body,
      }));
      if (focus.browserChrome) await page.keyboard.press(key);
      else expect(focus.inside).toBe(true);
      await expect.poll(() => dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
    }
    if (action === 'Open') await page.keyboard.press('Escape');
    else await close.click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  });
}

test('single and missing images do not expose multiple-image controls', async ({ page }) => {
  await openProduct(page, 'e2e-detail-single');
  await expect(page.getByRole('button', { name: 'Open image gallery for E2E Detail Single Image' })
    .getByRole('img', { name: 'Fictional rear angle' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next product image' })).toHaveCount(0);
  await openProduct(page, 'e2e-detail-soldout');
  const fallback = page.getByRole('button', { name: 'Open image gallery for E2E Detail Sold Out' }).getByRole('img');
  await expect(fallback).toHaveAttribute('alt', 'E2E Detail Sold Out');
  await expect(fallback).toHaveAttribute('src', /product-placeholder/);
  await expect(page.getByRole('button', { name: 'Next product image' })).toHaveCount(0);
  await expect(purchase(page).getByText('Out of Stock')).toBeVisible();
  const add = addButton(purchase(page), 'E2E Detail Sold Out');
  await expect(add).toHaveText('Unavailable');
  await expect(add).toBeDisabled();
  await expect(purchase(page).getByRole('textbox', { name: 'Quantity' })).toBeDisabled();
});

test('low stock bounds the editable quantity and moving to another product resets it', async ({ page, catalogueSafety }) => {
  await openProduct(page, 'e2e-detail-low');
  const panel = purchase(page);
  const quantity = panel.getByRole('textbox', { name: 'Quantity' });
  const decrease = panel.getByRole('button', { name: 'Decrease quantity' });
  const increase = panel.getByRole('button', { name: 'Increase quantity' });
  await expect(panel.getByText('Only 3 left')).toBeVisible();
  await expect(quantity).toHaveValue('1');
  await expect(decrease).toBeDisabled();
  await quantity.focus();
  await page.keyboard.press('Tab');
  await expect(increase).toBeFocused();
  await expect.poll(() => increase.evaluate(control => control.matches(':focus-visible'))).toBe(true);
  await page.keyboard.press('Enter');
  await expect(quantity).toHaveValue('2');
  await increase.click();
  await expect(quantity).toHaveValue('3');
  await expect(increase).toBeDisabled();
  for (const invalid of ['', '0', '-1', '1.5', '4']) {
    await quantity.fill(invalid);
    await expect(quantity).toHaveAttribute('aria-invalid', 'true');
    await expect(panel.getByRole('status').filter({ hasText: 'Enter a whole number from 1 to 3.' })).toBeVisible();
    await expect(addButton(panel, 'E2E Detail Low Stock')).toBeDisabled();
  }
  expect(catalogueSafety.detailCart?.additions).toEqual([]);
  await quantity.fill('2');
  await panel.getByRole('button', { name: 'Decrease quantity' }).press('Enter');
  await expect(quantity).toHaveValue('1');
  await quantity.fill('3');
  await page.getByRole('main').getByRole('link', { name: 'E2E Detail Single Image' }).first().click();
  await expect(page.getByRole('heading', { name: 'E2E Detail Single Image', exact: true })).toBeVisible();
  await expect(quantity).toHaveValue('1');
});

test('signed-out addition shares quantity between desktop and mobile and updates the cart', async ({ page, catalogueSafety }) => {
  await openProduct(page);
  await purchase(page).getByRole('textbox', { name: 'Quantity' }).fill('3');
  await page.setViewportSize({ width: 390, height: 844 });
  const bar = mobilePurchase(page);
  await expect(bar.getByRole('textbox', { name: 'Quantity' })).toHaveValue('3');
  await expect(bar).toContainText('₹300');
  await expect(bar).toContainText('₹450');
  await expect(bar).toContainText('33%');
  await addButton(bar).click();
  await expect(addButton(bar)).toHaveText('In Cart (3)');
  await expect(page.getByText(`${name} added to your cart.`)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cart with 3 items' })).toBeVisible();
  expect(catalogueSafety.detailCart?.additions).toEqual([{ productId, quantity: 3 }]);
});

test.describe('authenticated pending addition', () => {
  test.use({ detailCartOptions: { authenticated: true, initialQuantity: 118, holdAddition: true } });

  test('does not duplicate a pending addition and reaches the cumulative stock limit', async ({ page, catalogueSafety }) => {
    await openProduct(page);
    const panel = purchase(page);
    const quantity = panel.getByRole('textbox', { name: 'Quantity' });
    await expect(panel.getByText('Only 2 left')).toBeVisible();
    await quantity.fill('3');
    await expect(addButton(panel)).toBeDisabled();
    await quantity.fill('2');
    await addButton(panel).click();
    await expect.poll(() => catalogueSafety.detailCart?.additions).toEqual([{ productId, quantity: 2 }]);
    await expect(addButton(panel)).toBeDisabled();
    await expect(addButton(panel)).toHaveAttribute('aria-busy', 'true');
    await page.keyboard.press('Enter');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(addButton(mobilePurchase(page))).toBeDisabled();
    await expect(addButton(mobilePurchase(page))).toHaveAttribute('aria-busy', 'true');
    catalogueSafety.detailCart?.release();
    await expect(mobilePurchase(page).getByText('Maximum in Cart')).toBeVisible();
    await expect(mobilePurchase(page).getByRole('textbox', { name: 'Quantity' })).toBeDisabled();
    expect(catalogueSafety.detailCart?.additions).toEqual([{ productId, quantity: 2 }]);
  });
});

test.describe('controlled rejection', () => {
  test.use({ detailCartOptions: { rejectAddition: true } });

  test('shows the API error without success or a cart update and re-enables the controls', async ({ page, catalogueSafety }) => {
    await openProduct(page);
    const panel = purchase(page);
    await panel.getByRole('textbox', { name: 'Quantity' }).fill('2');
    const add = addButton(panel);
    await add.click();
    await expect(page.getByText('Synthetic stock limit reached.')).toBeVisible();
    await expect(page.getByText(`${name} added to your cart.`)).toHaveCount(0);
    await expect(add).toBeEnabled();
    await expect(panel.getByRole('textbox', { name: 'Quantity' })).toHaveValue('2');
    await expect(page.getByRole('button', { name: 'Cart with 0 items' })).toBeVisible();
    expect(catalogueSafety.detailCart?.additions).toEqual([{ productId, quantity: 2 }]);
  });
});

test.describe('missing detail', () => {
  test.use({ detailCartOptions: { scenario: 'missing' } });
  test('shows a not-found page with working browse recovery', async ({ page }) => {
    await openProduct(page, missingDetailSlug);
    await expect(page.getByRole('heading', { name: 'This page took a wrong turn' })).toBeVisible();
    await Promise.all([
      page.waitForURL('http://127.0.0.1:3100/products'),
      page.getByRole('link', { name: 'Browse Products' }).click(),
    ]);
    await expect(page.getByRole('searchbox', { name: 'Search products' })).toBeVisible();
  });
});

test.describe('upstream detail error', () => {
  test.use({ detailCartOptions: { scenario: 'upstream' } });
  test('shows safe detail-specific recovery and permits retry', async ({ page }) => {
    await openProduct(page, unavailableDetailSlug);
    const heading = page.getByRole('heading', { name: 'We couldn’t load this product' });
    await expect(heading).toBeVisible();
    await expect(page.getByText(/FIXTURE_DETAIL_UNAVAILABLE|Synthetic detail service failure/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(heading).toBeVisible();
    await page.getByRole('link', { name: 'Browse Products' }).click();
    await expect(page).toHaveURL('http://127.0.0.1:3100/products');
  });
});

test('streams product loading feedback before the detail renders', async ({ page }) => {
  await page.goto(`/products/${slowDetailSlug}`, { waitUntil: 'commit' });
  await expect(page.getByRole('status').filter({ hasText: 'Loading product details…' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'E2E Detail Loading', exact: true })).toBeVisible();
});

for (const width of [375, 390, 430, 768, 1024, 1440]) {
  test(`keeps the detail purchase and gallery usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await openProduct(page);
    const panel = width < 768 ? mobilePurchase(page) : purchase(page);
    await expect(panel.getByRole('textbox', { name: 'Quantity' })).toBeVisible();
    const add = addButton(panel);
    if (width < 768) await expect(add).toBeInViewport({ ratio: 1 });
    else await expect(add).toBeVisible();
    await expect.poll(async () => (await page.evaluate(measureOverflow)).overflowingElements).toEqual([]);
    if (width >= 1024) await expect(panel).toHaveCSS('position', 'sticky');
    await page.getByRole('button', { name: `Open image gallery for ${name}` }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Close image gallery' })).toBeInViewport({ ratio: 1 });
    await expect.poll(async () => (await page.evaluate(measureOverflow)).overflowingElements).toEqual([]);
    await page.keyboard.press('Escape');
    if (width < 768) {
      const footerLink = page.getByRole('contentinfo').getByRole('link').last();
      await footerLink.focus();
      await expect(mobilePurchase(page)).toBeHidden();
    }
  });
}
