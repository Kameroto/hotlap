# HotLap browser tests

## Isolated catalogue runner foundation

From the repository root, run the test-only launcher smoke check with installed Node/tsx tooling:

```bash
TSX_DISABLE_CACHE=1 node --import ./services/api/node_modules/tsx/dist/loader.mjs ./tests/e2e/helpers/catalogue-runner.ts
```

This Linux/WSL launcher uses the immutable fixture on `127.0.0.1:4100` and a staged Next.js instance on `127.0.0.1:3100`. Occupied test ports are rejected; existing services are never replaced. It does not need PostgreSQL or the real API. It does not use the existing Playwright configuration.

Each run lives in `<repository-root>/.hotlap-e2e-runtime/catalogue-*`, relative to the repository root. This ignored location is separate from Playwright's disposable output directories. Source/configuration/assets are copied without environment files or build caches; only installed `node_modules` is linked. Generated Next.js files stay in the copy. No dependency installation or CPU profiling occurs.

Fonts are deterministic and test-only. Before staging, the runner verifies all 16 vendored WOFF2 files, three CSS snapshots and three OFL notices against `fixtures/fonts/manifest.json`. [Font provenance, licensing and hashes](fixtures/fonts/README.md) are retained with the fixtures. No files are loaded from previous ignored runs, and no fonts or licenses are downloaded from external services at runtime. With the fixtures and normal dependencies present, a fresh clone is sufficient; a missing original `next-env.d.ts` is generated only inside staging.

An owned `127.0.0.1` font server uses an OS-assigned port and an exact read-only asset allowlist. The runner generates runtime-specific CommonJS stylesheet responses and injects `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` only into its Next child. This internal contract is pinned to Next.js 16.2.12; upgrades fail the version check pending review. Turbopack still fetches the actual binaries over HTTP, from this loopback listener. Readiness additionally verifies all 16 served/emitted font hashes and mock evaluation, without live Google Fonts fallback.

The Next.js `Ready` message starts the next readiness stage; it is not catalogue readiness. Exactly one `/products` request must complete with HTTP 200, all six fixture products, both categories, and category/product GET evidence in the fixture journal. The default cold-route deadline is **240,000 ms**. Set `HOTLAP_CATALOGUE_READY_TIMEOUT_MS` to an integer from 1,000 through 240,000 to lower it. Initial Next.js startup has a separate 60-second limit. Neither stage retries.

`startCatalogueRunner({ coldTimeoutMs })` in `helpers/catalogue-runner.ts` returns `{ baseURL, runtimeDir, stop }` only after validation. Consumers must `await stop()` in `finally`. The CLI performs this shutdown immediately after its smoke check. SIGINT/SIGTERM abort startup or close a returned runner. There is no Playwright integration or browser test in this foundation.

Diagnostics are retained: `report.json`, bounded stdout/stderr and timeline logs, bounded HTML sample, fixture-journal snapshots, and process ownership records. Logs/samples are capped at 2 MiB each; responses over 8 MiB fail validation. The report preserves final milestones independently of log caps. Fixture diagnostics are captured before shutdown and again before fixture closure. Cleanup validates PID/start identities, test-port release, original input hashes/dependency links, and previously visible service identities. Unavailable service PIDs permit only a listener check. Original active development caches are not required to remain identical.

Font requests are logged separately (1 MiB cap; 100 requests retained in the report), with a bounded mock-evaluation log. Shutdown preserves these diagnostics, terminates verified Next children, then closes the owned font listener and catalogue fixture independently; cleanup errors reject shutdown. No browser/font rendering or repeat-run performance guarantee is implied.

Validate font hashes, mappings and the raw route allowlist offline before a smoke launch:

```bash
pnpm --filter @hotlap/api exec tsx --test ../../tests/e2e/fixtures/catalogue-fonts.contract.ts
```

The child-only Node connection guard rejects ports 3000, 4000 and 5432. It is not an operating-system network sandbox. SIGKILL, abrupt host termination and direct `process.exit()` cannot guarantee asynchronous cleanup; inspect retained ownership identities before taking manual action. Never terminate processes by port number alone. Retained runtime directories are not automatically deleted.

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
pnpm --filter web exec tsc -p ../../tests/e2e/tsconfig.json
node services/api/node_modules/eslint/bin/eslint.js --config services/api/eslint.config.mjs tests/e2e playwright.config.ts --max-warnings=0
```

Limits: this is Chromium emulation, not physical Android/iOS or WebKit. Measurements describe element geometry with axis-aligned ancestor clips, not pixel-level filter/shadow ink, arbitrary clip-path/mask shapes, rotated clipping regions, pseudo-elements or closed shadow roots. Root scroll-range checks remain independent of the geometry scan. Gestures cover the selected homepage surfaces in both directions; this is not a general accessibility/performance or site-wide regression suite. Checkpoints verify settled positions, not every transient compositor frame.


## UI.7.2A navigation keyboard coverage

Run the focused tests against already running web/API/PostgreSQL services:

```bash
pnpm exec playwright test tests/e2e/navigation-keyboard.spec.ts --workers=1
pnpm exec playwright test --workers=1
```

The existing configuration may start missing application servers. Check readiness first when server startup is outside the authorized task. This batch does not change that configuration or run any database setup.

`navigation-keyboard.spec.ts` uses desktop 1440×900 and mobile-sized 375×812 Chromium pages. It covers Products disclosure Enter/Space/ArrowDown opening, forward/reverse Tab and outside dismissal; modal initial focus, Tab/Shift+Tab, Escape/close buttons, scroll locking/restoration; mobile menu links; menu-to-search/cart handoffs; and keyboard search clearing. Mobile-sized tests intentionally exercise keyboard input, not touch emulation or UI.6 gestures. Role/name locators are preferred; the desktop menu uses the existing `aria-controls` ID and native `dialog:modal` selectors inspect modal state.

Focus is reached using actual Tab input. Chromium can temporarily move focus into browser chrome when tabbing past a native dialog boundary (`document.hasFocus() === false`, active element reported as BODY). The tests record that state and require the next same-direction Tab to return to the modal. Focus on the page BODY while the document still has focus is **not** exempted, and no background control may receive focus. A search-clear failure is retained if removing the focused clear button loses document focus context rather than returning useful focus to the input.

`helpers/signed-out-test.ts` provides a new empty-storage context with service workers blocked. It intercepts POST `/api/v1/auth/refresh` with the existing signed-out 401 contract and GET `/api/v1/cart` with a typed, empty `ServerCart`. Public product/category/event GETs are allowlisted; other API paths and unexpected state-changing browser requests are blocked and fail the test. Credentials, query strings and payloads are not logged. The six existing homepage tests use the same fixture; their UI.6 assertions are unchanged. In-memory smoke/detector cases do not load the application.

Browser interception does not control Next.js server-side fetches. The tested `/about` page uses global category loading; the existing homepage/catalogue cases use public server-side read paths. This is not an isolated backend integration test, and unrelated activity in the running services is outside the browser guard's visibility.

Each test using the fixture attaches `keyboard-safety.json` with request decisions, page/request error summaries, active element, document focus, dialog/disclosure states and root scroll/overflow checkpoints. Failures also retain the configured screenshot and trace plus `keyboard-failure.png`. Artifacts live under `test-results/` and are linked in `playwright-report/index.html`. Test-specific TypeScript configuration reuses the web alias and installed Node types so fixture types are checked against actual application contracts.

Production defects are not marked expected failures or fixed in this test batch. A nonzero suite result must be reviewed with its diagnostics.

## Dedicated isolated catalogue browser smoke

```bash
pnpm exec playwright test --config tests/e2e/catalogue/playwright.catalogue.config.ts --list
pnpm exec playwright test --config tests/e2e/catalogue/playwright.catalogue.config.ts --workers=1
```

This independent Chromium configuration discovers only `catalogue/*.isolated.ts`, which the default configuration does not discover. It runs one 1440×900 smoke test, one worker and zero retries. It does not define `webServer` or start normal development services. Ports 3100 and 4100 must be free.

Global setup awaits the existing runner's complete catalogue/fixture/font readiness checks before returning an asynchronous teardown that awaits `stop()`. Existing startup deadlines and the maximum 240-second cold-readiness deadline apply; browser tests have a separate 30-second timeout. A suite-wide global deadline is disabled to avoid exhausting the same deadline during cleanup. Startup and teardown failures remain failures.

Each invocation shares a coordinator-generated output path with workers under `<repository-root>/.hotlap-e2e-runtime/playwright-catalogue-<id>/` (`results/` and `report/`), separate from the runner's `catalogue-*` runtime. Attachments identify runner diagnostics and sanitized browser decisions; the runner also records `playwright-lifecycle.json` showing teardown invocation and awaited shutdown. Neither output location overlaps the original suite's outputs.

The browser fixture reuses signed-out auth/cart mocks through `route.fallback()`, blocks other origins and unsupported API requests, and permits only the isolated Next.js HMR WebSocket. Browser routing does not intercept server-side Next.js fetches and is not an OS network sandbox; server-side isolation remains the runner's responsibility.

No competing signal handlers are installed. During pending startup, the runner's signal-triggered abort follows its startup cleanup path. After readiness, runner shutdown is idempotent and the returned Playwright teardown awaits it. Normal interruption during setup or browser execution still requires separately authorized experimental acceptance testing. SIGKILL, forced supervisor termination or host failure cannot guarantee asynchronous cleanup; retain diagnostics and verify recorded PID/start-time ownership before recovery. Filtering, sorting, pagination and product-detail browser scenarios are outside this smoke check.
