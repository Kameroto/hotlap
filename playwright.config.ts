import {
  defineConfig,
  devices,
} from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 7_500,
  },
  forbidOnly: Boolean(
    process.env.CI,
  ),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    [
      "html",
      {
        open: "never",
        outputFolder:
          "playwright-report",
      },
    ],
  ],
  use: {
    baseURL:
      "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: [
    {
      command: "pnpm dev:api",
      url: "http://localhost:4000/api/v1/database",
      reuseExistingServer:
        !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm dev:web",
      url: "http://localhost:3000",
      reuseExistingServer:
        !process.env.CI,
      timeout: 120_000,
    },
  ],
});
