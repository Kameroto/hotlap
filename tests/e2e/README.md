# HotLap browser tests

The Playwright configuration starts the existing API and web development commands. PostgreSQL must be available first:

```bash
pnpm db:up
```

Install the Chromium browser and its Linux runtime dependencies once per WSL environment:

```bash
pnpm exec playwright install chromium
sudo pnpm exec playwright install-deps chromium
```

Run the complete Chromium suite:

```bash
pnpm test:e2e
```

Run only the responsive homepage checks:

```bash
pnpm exec playwright test tests/e2e/responsive-overflow.spec.ts
```

Optional headed mode requires a working WSL display environment:

```bash
pnpm exec playwright test --headed
```

Headless Chromium is the supported default. Failure screenshots, traces, HTML reports, and generated responsive screenshots are written to ignored Playwright output directories.

## UI.6 containment and input coverage

`responsive-overflow.spec.ts` checks 375, 390, 430, 768, 1024 and 1440 CSS-pixel widths at 1000px height. The three phone widths use mobile, touch-enabled Chromium contexts; other widths use desktop contexts. The existing global Chromium configuration is unchanged.

The detector in `helpers/overflow.ts` intersects element rectangles with applicable ancestor scroll/overflow/paint clips. It does **not** clip against the viewport itself, exempt absolute positioning or `aria-hidden`, or blanket-ignore carousel descendants. It handles positioned descendants whose containing block escapes an intermediate overflow container. `overflow-detector.spec.ts` exercises both clipped and genuinely overflowing content, including nested clips and absolute/fixed escape cases.

Every viewport receives browser horizontal wheel input in both directions over the Hero, categories and Beginner Guide. Phone contexts additionally receive a timed Chromium CDP `Input.dispatchTouchEvent` sequence (touchStart, 20 touchMoves, touchEnd). These enter Chromium's native input/scrolling pipeline; they are not JavaScript `dispatchEvent` calls or assignments to `scrollLeft`. A successful CDP call alone is insufficient: the guide must actually move forward and backward, while root offsets and Hero/category/guide outer X positions remain unchanged. The test waits for scroll inertia/snap to settle before each measurement.

Each checkpoint asserts zero root horizontal scroll range and offsets, no effectively visible viewport overflow, image loading/containment, category columns, and the guide as the sole intentional horizontal scroller. The measurement function itself never scrolls anything.

Artifacts are isolated per test using Playwright's `testInfo.outputPath`:

- `test-results/responsive-overflow-*/initial.png`: full homepage before input.
- The same directory's `wheel-*.png` / `touch-*.png`: viewport screenshots at interaction checkpoints.
- `measurements.json`: raw/clipped bounds, clipping ancestors, root offsets, image/card bounds and guide scroll offsets at every checkpoint, including checkpoints recorded before an assertion failure.
- `playwright-report/index.html`: report with attached screenshots and measurements.

Run the browser suite serially when sharing existing development servers:

```bash
pnpm exec playwright test tests/e2e/chromium-smoke.spec.ts tests/e2e/overflow-detector.spec.ts tests/e2e/responsive-overflow.spec.ts --workers=1
```

Workspace typecheck/lint scripts do not include root E2E files. Check these explicitly using the existing installed tools:

```bash
pnpm --filter web exec tsc --noEmit --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler --lib ES2022,DOM,DOM.Iterable ../../playwright.config.ts ../../tests/e2e/responsive-overflow.spec.ts ../../tests/e2e/overflow-detector.spec.ts ../../tests/e2e/chromium-smoke.spec.ts
node services/api/node_modules/eslint/bin/eslint.js --config services/api/eslint.config.mjs tests/e2e playwright.config.ts --max-warnings=0
```

Limits: this is Chromium emulation, not physical Android/iOS or WebKit. Measurements describe element geometry with axis-aligned ancestor clips, not pixel-level filter/shadow ink, arbitrary clip-path/mask shapes, rotated clipping regions, pseudo-elements or closed shadow roots. Root scroll-range checks remain independent of the geometry scan. Gestures cover the selected homepage surfaces in both directions; this is not a general accessibility/performance or site-wide regression suite. Checkpoints verify settled positions, not every transient compositor frame.
