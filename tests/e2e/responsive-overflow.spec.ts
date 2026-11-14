import { writeFile } from 'node:fs/promises';
import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { measureOverflow } from './helpers/overflow';

const widths = [375, 390, 430, 768, 1024, 1440] as const;
const tolerance = 1;
const heroAlt = 'AI-generated development artwork of a performance RC sports car';

async function measureHomepage(page: Page) {
  const layout = await page.evaluate((alt) => {
    const bounds = (element: Element) => {
      const { left, right, width } = element.getBoundingClientRect();
      return { left, right, width };
    };
    const image = document.querySelector<HTMLImageElement>(`img[alt="${alt}"]`)!;
    const categories = [...document.querySelectorAll('#shop-by-category a[href^="/products?category="]')];
    const guide = [...document.querySelectorAll('h2')].find(h => h.textContent?.includes('Start smarter.'))!.closest('section')!;
    const scroller = [...guide.querySelectorAll<HTMLElement>('*')].find(el =>
      getComputedStyle(el).overflowX === 'auto' && el.scrollWidth > el.clientWidth + 1)!;
    if (!image?.parentElement || !categories.length || !scroller) throw new Error('Required homepage elements missing');
    return {
      root: { clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
        windowX: window.scrollX, documentX: document.documentElement.scrollLeft, bodyX: document.body.scrollLeft },
      hero: { image: bounds(image), wrapper: bounds(image.parentElement),
        complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight },
      categories: { cards: categories.map(bounds), columns: new Set(categories.map(el => Math.round(el.getBoundingClientRect().left))).size },
      guide: { bounds: bounds(scroller), scrollLeft: scroller.scrollLeft,
        clientWidth: scroller.clientWidth, scrollWidth: scroller.scrollWidth, overflowX: getComputedStyle(scroller).overflowX },
    };
  }, heroAlt);
  return { ...layout, ...await page.evaluate(measureOverflow) };
}
type Measurements = Awaited<ReturnType<typeof measureHomepage>>;

function assertContained(m: Measurements, width: number) {
  expect(m.root.scrollWidth, 'document has no horizontal scroll range').toBe(m.root.clientWidth);
  for (const x of [m.root.windowX, m.root.documentX, m.root.bodyX]) expect(Math.abs(x)).toBeLessThanOrEqual(tolerance);
  expect(m.overflowingElements, 'effective bounds outside viewport').toEqual([]);
  expect(m.horizontalScrollers).toHaveLength(1);
  expect(m.horizontalScrollers[0].isBeginnerGuide).toBe(true);
  expect(m.hero.complete).toBe(true);
  expect(m.hero.naturalWidth).toBeGreaterThan(0);
  expect(m.hero.naturalHeight).toBeGreaterThan(0);
  expect(m.hero.image.left).toBeGreaterThanOrEqual(m.hero.wrapper.left - tolerance);
  expect(m.hero.image.right).toBeLessThanOrEqual(m.hero.wrapper.right + tolerance);
  for (const box of [m.hero.wrapper, ...m.categories.cards, m.guide.bounds]) {
    expect(box.left).toBeGreaterThanOrEqual(-tolerance);
    expect(box.right).toBeLessThanOrEqual(width + tolerance);
  }
  expect(m.categories.columns).toBe(width >= 1024 ? 3 : width >= 768 ? 2 : 1);
  expect(m.guide.scrollWidth).toBeGreaterThan(m.guide.clientWidth);
  expect(m.guide.overflowX).toBe('auto');
}

function assertStationary(before: Measurements, after: Measurements) {
  // Vertical positioning may change when bringing the guide into view. X must not.
  const positions = (m: Measurements) => [m.hero.image, m.hero.wrapper, ...m.categories.cards, m.guide.bounds];
  const initial = positions(before);
  positions(after).forEach((box, index) => {
    expect(Math.abs(box.left - initial[index].left)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(box.right - initial[index].right)).toBeLessThanOrEqual(tolerance);
  });
}

async function settleScrolling(page: Page) {
  // Wait through inertia / scroll snap, rather than sampling only immediately after input.
  await page.evaluate(async () => {
    let last = '';
    let stable = 0;
    const deadline = performance.now() + 5000;
    while (stable < 12) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      const state = JSON.stringify([window.scrollX, window.scrollY,
        ...[...document.querySelectorAll<HTMLElement>('*')]
          .filter(el => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === 'auto')
          .map(el => el.scrollLeft)]);
      stable = state === last ? stable + 1 : 0;
      last = state;
      if (performance.now() > deadline) throw new Error('Scrolling did not settle');
    }
  });
}

async function gesture(page: Page, target: Locator, direction: 'left' | 'right', touch: boolean) {
  // Use a visible point near the top of the target (the guide can be taller than the viewport).
  const box = await target.boundingBox();
  if (!box) throw new Error('Gesture target missing');
  const viewport = page.viewportSize()!;
  const x = direction === 'left' ? viewport.width * 0.78 : viewport.width * 0.22;
  const y = Math.max(100, Math.min(viewport.height - 100, Math.max(0, box.y) + 90));
  expect(x).toBeGreaterThan(box.x);
  expect(x).toBeLessThan(box.x + box.width);
  expect(y).toBeGreaterThan(box.y);
  expect(y).toBeLessThan(box.y + box.height);
  if (touch) {
    const session = await page.context().newCDPSession(page);
    try {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart', touchPoints: [{ x, y, radiusX: 4, radiusY: 4, force: 1, id: 0 }],
      });
      for (let step = 1; step <= 20; step++) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove', touchPoints: [{
            x: x + (direction === 'left' ? -1 : 1) * viewport.width * 0.56 * step / 20,
            y, radiusX: 4, radiusY: 4, force: 1, id: 0,
          }],
        });
        await new Promise(resolve => setTimeout(resolve, 16));
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } finally { await session.detach(); }
  } else {
    await page.mouse.move(x, y);
    await page.mouse.wheel(direction === 'left' ? viewport.width * 0.8 : -viewport.width * 0.8, 0);
  }
  await settleScrolling(page);
}

for (const width of widths) {
  test.describe(`${width}px`, () => {
    const mobile = width <= 430;
    test.use({ viewport: { width, height: 1000 }, isMobile: mobile, hasTouch: mobile });
    test('homepage containment and browser horizontal input', async ({ page, browserName }, testInfo) => {
      test.setTimeout(90_000);
      const diagnostics: { label: string; measurements: Measurements }[] = [];
      try {
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await expect(page.getByAltText(heroAlt)).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Shop by Category', exact: true })).toBeVisible();
        const catalogueLink = page.getByRole('link', { name: 'Explore the catalogue', exact: true });
        await expect(catalogueLink).toHaveAttribute('href', '/products');
        const baseline = await checkpoint('initial');
        const hero = page.getByAltText(heroAlt).locator('xpath=ancestor::section');
        const guideSection = page.locator('section').filter({ has: page.getByRole('heading', { name: /Start smarter\./ }) });
        const guide = guideSection.locator('div.overflow-x-auto');

        for (const touch of mobile && browserName === 'chromium' ? [false, true] : [false]) {
          const input = touch ? 'touch' : 'wheel';
          await hero.scrollIntoViewIfNeeded();
          await settleScrolling(page);
          await checkpoint(`${input}-hero-before`);
          for (const direction of ['left', 'right'] as const) {
            await gesture(page, hero, direction, touch);
            await checkpoint(`${input}-hero-${direction}`);
          }
          // Root containment must also hold when gestures start over category content.
          await page.locator('#shop-by-category').scrollIntoViewIfNeeded();
          await settleScrolling(page);
          for (const direction of ['left', 'right'] as const) {
            await gesture(page, page.locator('#shop-by-category'), direction, touch);
            await checkpoint(`${input}-categories-${direction}`);
          }
          await guide.scrollIntoViewIfNeeded();
          await settleScrolling(page);
          const before = await checkpoint(`${input}-guide-before`);
          await gesture(page, guide, 'left', touch);
          const forward = await checkpoint(`${input}-guide-forward`);
          expect(forward.guide.scrollLeft, `${input} must really scroll the guide`).toBeGreaterThan(before.guide.scrollLeft + 1);
          await gesture(page, guide, 'right', touch);
          const backward = await checkpoint(`${input}-guide-backward`);
          expect(backward.guide.scrollLeft, `${input} must reverse the guide`).toBeLessThan(forward.guide.scrollLeft - 1);
        }
        await catalogueLink.click();
        await expect(page).toHaveURL(/\/products$/);
        await expect(page.getByRole('heading', { name: 'Explore All Products', exact: true })).toBeVisible();

        async function checkpoint(label: string) {
          const measurements = await measureHomepage(page);
          diagnostics.push({ label, measurements });
          await screenshot(page, testInfo, label);
          assertContained(measurements, width);
          if (label !== 'initial') assertStationary(baseline, measurements);
          return measurements;
        }
      } finally {
        const report = JSON.stringify({ width, mobile,
          touchMethod: mobile ? 'Chromium CDP Input.dispatchTouchEvent (native touch pipeline)' : 'not run: desktop context',
          checkpoints: diagnostics }, null, 2);
        const path = testInfo.outputPath('measurements.json');
        await writeFile(path, report);
        await testInfo.attach('measurements', { path, contentType: 'application/json' });
      }
    });
  });
}

async function screenshot(page: Page, info: TestInfo, label: string) {
  const path = info.outputPath(`${label}.png`);
  await page.screenshot({ path, fullPage: label === 'initial', animations: 'disabled' });
  await info.attach(label, { path, contentType: 'image/png' });
}
