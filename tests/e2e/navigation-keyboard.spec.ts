import { expect, type Locator, type Page } from '@playwright/test';
import { browserState, test } from './helpers/signed-out-test';

type ScrollState = Awaited<ReturnType<typeof browserState>>['scroll'];
const modalCount = (page: Page) => page.locator('dialog:modal');
const primary = (page: Page) => page.getByRole('navigation', { name: 'Primary navigation', exact: true });

// Locate via actual keyboard traversal. No focus(), click(), activeElement writes
// or DOM event dispatch is used to manufacture keyboard focus.
async function tabTo(page: Page, target: Locator) {
  await expect(target).toBeVisible();
  for (let step = 0; step < 70; step++) {
    if (await target.evaluate(element => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  await expect(target, 'target must be reachable using Tab').toBeFocused();
}

async function settleScroll(page: Page) {
  await page.evaluate(async () => {
    let previous = '';
    let stable = 0;
    const deadline = performance.now() + 5000;
    while (stable < 10) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      const current = `${window.scrollX},${window.scrollY}`;
      stable = current === previous ? stable + 1 : 0;
      previous = current;
      if (performance.now() > deadline) throw new Error('Root scrolling did not settle');
    }
  });
}

async function checkFocusIndicator(target: Locator) {
  await expect(target).toBeFocused();
  await expect(target).toBeInViewport();
  expect(await target.evaluate(element => {
    const style = getComputedStyle(element);
    return element.matches(':focus-visible') &&
      ((style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== 'none');
  }), 'keyboard-focused control has a visible outline or ring').toBe(true);
}

async function checkModal(page: Page, dialog: Locator) {
  await expect(dialog).toBeVisible();
  await expect(modalCount(page)).toHaveCount(1);
  expect(await dialog.evaluate(element => element.matches(':modal'))).toBe(true);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
}

async function walkModal(page: Page, dialog: Locator, record: (label: string) => Promise<void>) {
  const count = await dialog.evaluate(element => [...element.querySelectorAll<HTMLElement>(
    'a[href],button,input,select,textarea,[tabindex]',
  )].filter(control => control.tabIndex >= 0 && !control.matches(':disabled') && control.checkVisibility()).length);
  expect(count, 'modal has keyboard controls').toBeGreaterThan(1);
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let step = 0; step < count + 1; step++) {
      await page.keyboard.press(key);
      await record(`${key}-${step}`);
      const state = await browserState(page);
      if (!state.documentHasFocus) {
        // Chromium permits Tab into browser chrome at the end of a native
        // dialog's controls. This is not page/background focus. The very next
        // Tab in the same direction must return to this modal, not the page.
        expect(state.focused?.tag).toBe('BODY');
        await expect(modalCount(page)).toHaveCount(1);
        await page.keyboard.press(key);
        await record(`${key}-${step}-return-from-browser-chrome`);
      }
      await expect.poll(() => dialog.evaluate(element =>
        document.hasFocus() && element.contains(document.activeElement)),
      'Tab must not move focus onto background controls').toBe(true);
    }
  }
}

async function scrolledBackground(page: Page, trigger: Locator): Promise<ScrollState> {
  await tabTo(page, trigger);
  await page.mouse.move(5, page.viewportSize()!.height / 2);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await settleScroll(page);
  await checkFocusIndicator(trigger);
  return (await browserState(page)).scroll;
}

async function checkLockedPosition(page: Page, before: ScrollState) {
  // Pointer input over the modal backdrop must not scroll the document either.
  await page.mouse.move(2, page.viewportSize()!.height / 2);
  await page.mouse.wheel(0, 220);
  await settleScroll(page);
  const current = (await browserState(page)).scroll;
  expect(Math.abs(current.y - before.y)).toBeLessThanOrEqual(1);
  expect(current.x).toBe(before.x);
  expect(current.bodyInlineOverflow).toBe('hidden');
}

async function checkRestored(page: Page, dialog: Locator, trigger: Locator, before: ScrollState) {
  await expect(dialog).not.toBeVisible();
  await expect(modalCount(page)).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(before.bodyInlineOverflow);
  await settleScroll(page);
  const after = (await browserState(page)).scroll;
  expect(after.bodyComputedOverflow).toBe(before.bodyComputedOverflow);
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
  expect(after.x).toBe(before.x);
  await page.mouse.move(5, page.viewportSize()!.height / 2);
  await page.mouse.wheel(0, -120);
  await expect.poll(() => page.evaluate(() => window.scrollY), 'root can scroll again after closing').toBeLessThan(before.y - 1);
  await settleScroll(page);
}

test.beforeEach(async ({ page, safety }) => {
  // /about uses the same global Navbar/overlays without loading homepage products.
  await page.goto('/about');
  await expect.poll(() => safety.requests.filter(request => request.disposition === 'mock-auth').length).toBeGreaterThan(0);
  await expect.poll(() => safety.requests.filter(request => request.disposition === 'mock-cart').length).toBeGreaterThan(0);
  await expect(primary(page)).toBeVisible();
  await safety.record('hydrated-signed-out');
});

test.describe('desktop navigation at 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  for (const activation of ['Enter', 'Space', 'ArrowDown']) {
    test(`Products disclosure opens with ${activation} and closes with Escape`, async ({ page, safety }) => {
      const nav = primary(page);
      for (const name of ['HotLap home', 'Home', 'Events', 'About', 'Contact', 'Customer account', 'Wishlist with 0 products']) {
        await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
      }
      for (const name of ['Products', 'Open product search', 'Cart with 0 items']) {
        await expect(nav.getByRole('button', { name, exact: true })).toBeVisible();
      }
      const trigger = nav.getByRole('button', { name: 'Products', exact: true });
      await tabTo(page, trigger);
      await checkFocusIndicator(trigger);
      const overflow = (await browserState(page)).scroll.bodyInlineOverflow;
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await page.keyboard.press(activation);
      const menu = page.locator(`#${await trigger.getAttribute('aria-controls')}`);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(menu).toBeVisible();
      await checkFocusIndicator(menu.getByRole('link', { name: /^All Products/ }));
      await expect(modalCount(page)).toHaveCount(0);
      expect((await browserState(page)).scroll.bodyInlineOverflow).toBe(overflow);
      await safety.record(`disclosure-${activation}`);
      await page.keyboard.press('Escape');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });
  }

  test('Products permits reverse/forward Tab exit and closes on outside pointer', async ({ page, safety }) => {
    const nav = primary(page);
    const trigger = nav.getByRole('button', { name: 'Products', exact: true });
    await tabTo(page, trigger);
    await page.keyboard.press('ArrowDown');
    const menu = page.locator(`#${await trigger.getAttribute('aria-controls')}`);
    const links = menu.getByRole('link');
    await expect(links.first()).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(links.first()).toBeFocused();
    const count = await links.count();
    for (let index = 1; index < count; index++) {
      await page.keyboard.press('Tab');
      await expect(links.nth(index)).toBeFocused();
    }
    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link', { name: 'Events', exact: true })).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).not.toBeVisible();
    await page.keyboard.press('Shift+Tab');
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(links.first()).toBeFocused();
    // This one pointer action tests the actual outside-dismiss behavior, not keyboard focus setup.
    await page.getByRole('main').click({ position: { x: 10, y: 10 } });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).not.toBeVisible();
    await safety.record('nonmodal-exit');
  });
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
  test.describe(`shared overlays at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });
    for (const kind of ['search', 'cart'] as const) {
      test(`${kind}: keyboard focus, Tab containment, Escape and close-button restoration`, async ({ page, safety }) => {
        const trigger = primary(page).getByRole('button', {
          name: kind === 'search' ? 'Open product search' : 'Cart with 0 items', exact: true,
        });
        const dialog = page.getByRole('dialog', { name: kind === 'search' ? 'Search HotLap' : 'Your Cart', exact: true });
        const close = dialog.getByRole('button', { name: kind === 'search' ? 'Close product search' : 'Close cart drawer', exact: true });
        for (const method of ['Escape', 'close-button']) {
          const before = await scrolledBackground(page, trigger);
          await page.keyboard.press('Enter');
          await checkModal(page, dialog);
          await expect(trigger).toHaveAttribute('aria-expanded', 'true');
          if (kind === 'search') await expect(dialog.getByRole('searchbox', { name: 'Search HotLap products' })).toBeFocused();
          else {
            await expect(close).toBeFocused();
            await expect(dialog.getByText('Your cart is empty.', { exact: true })).toBeVisible();
            await expect(dialog.getByRole('link', { name: 'Continue Shopping', exact: true })).toBeVisible();
            await expect(dialog.getByRole('link', { name: 'Checkout', exact: true })).toHaveCount(0);
          }
          await safety.record(`${kind}-opened`);
          await walkModal(page, dialog, safety.record);
          await checkLockedPosition(page, before);
          if (method === 'Escape') await page.keyboard.press('Escape');
          else { await tabTo(page, close); await page.keyboard.press('Enter'); }
          await checkRestored(page, dialog, trigger, before);
          await expect(trigger).toHaveAttribute('aria-expanded', 'false');
          await safety.record(`${kind}-${method}-restored`);
        }
      });
    }

    test('clearing search with the keyboard preserves useful input focus', async ({ page, safety }) => {
      const trigger = primary(page).getByRole('button', { name: 'Open product search', exact: true });
      await tabTo(page, trigger);
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: 'Search HotLap', exact: true });
      const input = dialog.getByRole('searchbox', { name: 'Search HotLap products' });
      await expect(input).toBeFocused();
      // One character stays below the actual 2-character predictive request threshold.
      await page.keyboard.type('x');
      await page.keyboard.press('Tab');
      const clear = dialog.getByRole('button', { name: 'Clear product search', exact: true });
      await expect(clear).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(input).toHaveValue('');
      await expect(clear).toHaveCount(0);
      await safety.record('search-cleared');
      // Losing focus to body after removing the focused button is a real regression.
      await expect(input).toBeFocused();
      expect(await input.evaluate(element => document.activeElement === element)).toBe(true);
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate(element => element.matches(':modal'))).toBe(true);
      await page.keyboard.type('y');
      await expect(input).toHaveValue('y');
      await expect(input).toBeFocused();
      await safety.record('search-retyped');
      // Chromium's native search input consumes Escape to clear nonempty text.
      // Preserve that behavior, then verify modal Escape with the empty input.
      await page.keyboard.press('Escape');
      await expect(input).toHaveValue('');
      await expect(input).toBeFocused();
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(modalCount(page)).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  });
}

test.describe('mobile menu and handoffs at 375x812', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('menu traps keyboard focus and restores opener and root scrolling', async ({ page, safety }) => {
    const trigger = primary(page).getByRole('button', { name: /^(Open|Close) navigation menu$/ });
    const before = await scrolledBackground(page, trigger);
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Menu', exact: true });
    await checkModal(page, dialog);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog.getByRole('button', { name: 'Close navigation menu', exact: true })).toBeFocused();
    const nav = dialog.getByRole('navigation', { name: 'Mobile navigation', exact: true });
    for (const name of ['Home', 'Events', 'About', 'Contact', 'All Products', 'Customer Account', 'Wishlist']) {
      await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
    }
    await walkModal(page, dialog, safety.record);
    await checkLockedPosition(page, before);
    await page.keyboard.press('Escape');
    await checkRestored(page, dialog, trigger, before);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  for (const destination of ['search', 'cart'] as const) {
    test(`menu-to-${destination} handoff leaves one focused modal and restores menu opener`, async ({ page, safety }) => {
      const trigger = primary(page).getByRole('button', { name: /^(Open|Close) navigation menu$/ });
      for (const method of ['Escape', 'close-button']) {
        const before = await scrolledBackground(page, trigger);
        await page.keyboard.press('Enter');
        const menu = page.getByRole('dialog', { name: 'Menu', exact: true });
        await checkModal(page, menu);
        await tabTo(page, menu.getByRole('button', {
          name: destination === 'search' ? 'Search HotLap products' : 'Open cart with 0 items', exact: true,
        }));
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog', { name: destination === 'search' ? 'Search HotLap' : 'Your Cart', exact: true });
        await expect(menu).not.toBeVisible();
        await checkModal(page, dialog);
        const close = dialog.getByRole('button', { name: destination === 'search' ? 'Close product search' : 'Close cart drawer', exact: true });
        const initialFocus = destination === 'search' ? dialog.getByRole('searchbox', { name: 'Search HotLap products' }) : close;
        await expect(initialFocus).toBeFocused();
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await safety.record(`handoff-${destination}`);
        await walkModal(page, dialog, safety.record);
        await checkLockedPosition(page, before);
        if (method === 'Escape') await page.keyboard.press('Escape');
        else { await tabTo(page, close); await page.keyboard.press('Enter'); }
        await checkRestored(page, dialog, trigger, before);
        await safety.record(`handoff-${destination}-${method}-restored`);
      }
    });
  }
});
