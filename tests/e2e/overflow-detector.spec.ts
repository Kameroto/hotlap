import { expect, test } from '@playwright/test';
import { measureOverflow } from './helpers/overflow';

// Controlled positive/negative cases guard against hiding genuine overflow.
test('overflow detector respects clipping without blanket exemptions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.setContent(`
    <style>body { margin: 0 } .clip { position: relative; width: 300px; height: 80px; overflow: hidden; }
    .wide { position: absolute; left: -50px; top: 10px; width: 500px; height: 20px; background: orange; }</style>
    <div class="clip"><div id="clipped" class="wide" aria-hidden="true" style="filter:blur(10px)"></div></div>
    <div style="position:relative;width:300px"><div style="overflow:hidden;width:100px;height:80px">
      <div id="escaping-containing-block" class="wide"></div></div></div>
    <div id="visible" class="wide" aria-hidden="true" style="top:200px"></div>
    <div style="position:relative;width:500px;height:80px;overflow:clip"><div id="partially-clipped" class="wide"></div></div>
    <div style="position:relative;width:300px;height:40px;overflow:hidden">
      <div style="position:relative;width:500px;height:40px;overflow:auto"><div id="nested-clipped" style="width:800px;height:20px"></div></div></div>
    <div style="position:relative;width:300px;height:40px;overflow:hidden"><div id="fixed-escape" style="position:fixed;left:400px;top:300px;width:20px;height:20px;background:red"></div></div>
  `);
  const result = await page.evaluate(measureOverflow);
  const ids = result.overflowingElements.map(el => el.id);
  expect(ids).toEqual(expect.arrayContaining(['visible', 'partially-clipped', 'escaping-containing-block', 'fixed-escape']));
  expect(ids).not.toContain('clipped');
  expect(ids).not.toContain('nested-clipped');
  expect(result.clippedElements.map(el => el.id)).toContain('clipped');
  expect(result.clippedElements.map(el => el.id)).toContain('nested-clipped');
});
