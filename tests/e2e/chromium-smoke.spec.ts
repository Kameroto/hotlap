import {
  expect,
  test,
} from "@playwright/test";

test("Chromium renders a page", async ({
  page,
}) => {
  await page.setContent(`
    <!doctype html>
    <html lang="en">
      <head>
        <title>HotLap Playwright Smoke</title>
      </head>
      <body>
        <h1>Chromium is ready</h1>
      </body>
    </html>
  `);

  await expect(page).toHaveTitle(
    "HotLap Playwright Smoke",
  );
  await expect(
    page.getByRole("heading", {
      name: "Chromium is ready",
    }),
  ).toBeVisible();
});
