import { test, expect } from "@playwright/test";
test("guest lesson saved explicitly and restored across reload", async ({
  page,
}) => {
  await page.goto("/datum/#/learn/observations");
  await page
    .getByLabel(
      "Which variables would you collect to investigate a late delivery, and why?",
    )
    .fill("Distance, because longer trips may take longer.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  await page.reload();
  await expect(page.locator("#reflection")).toHaveValue(
    "Distance, because longer trips may take longer.",
  );
  await expect(page.getByText("Restored from this device.")).toBeVisible();
  await page.goto("/datum/#/settings");
  await expect(page.getByText(/1 saved drafts/)).toBeVisible();
  await expect(page.getByText(/Cloud sign-in is not configured/)).toBeVisible();
});
test("mission draft, code and filtered chart resume together", async ({
  page,
  isMobile,
}) => {
  await page.goto("/datum/#/investigate/legacy");
  if (isMobile)
    await page.getByRole("button", { name: "Brief", exact: true }).click();
  await page
    .getByLabel("Your initial hypothesis")
    .fill("Longer distances may explain delays.");
  if (isMobile)
    await page.getByRole("button", { name: "Workspace", exact: true }).click();
  await page.getByLabel("Search sample rows").fill("DL-1002");
  await page.getByRole("button", { name: "Chart", exact: true }).click();
  await expect(page.locator(".sample-chart>div")).toHaveCount(1);
  await expect(page.locator(".sample-chart")).toContainText("DL-1002");
  await page.getByRole("button", { name: "Python", exact: true }).click();
  await page.getByLabel("Python draft").fill('print("saved, not executed")');
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Python draft")).toHaveValue(
    'print("saved, not executed")',
  );
  await page.getByRole("button", { name: "Chart", exact: true }).click();
  await expect(page.locator(".sample-chart>div")).toHaveCount(1);
  await page.getByRole("button", { name: "Data", exact: true }).click();
  await expect(page.getByLabel("Search sample rows")).toHaveValue("DL-1002");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download sample CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("datum-layout-sample.csv");
});
test("search includes concepts and dashboard has correct title", async ({
  page,
}) => {
  await page.goto("/datum/#/");
  await expect(page).toHaveTitle("Dashboard · DATUM");
  await page.goto("/datum/#/learn");
  await page.getByLabel("Find a chapter or lesson").fill("imputation");
  await expect(
    page.getByRole("link", { name: /Missing is a signal/ }),
  ).toBeVisible();
});
test("unavailable storage reports failure without a false save", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new Error("Storage unavailable");
    };
  });
  await page.goto("/datum/#/learn/observations");
  await page.locator("#reflection").fill("Unsaved reflection");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Save failed");
  await expect(page.locator("#reflection")).toHaveValue("Unsaved reflection");
});
test("stale guest tab cannot overwrite a newer saved draft", async ({
  page,
  context,
}) => {
  await page.goto("/datum/#/learn/observations");
  await expect(page.locator("#reflection")).toBeEnabled();
  const other = await context.newPage();
  await other.goto("/datum/#/learn/observations");
  await other.locator("#reflection").fill("Newer other-tab work");
  await other.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(other.getByText("Saved on this device.")).toBeVisible();
  await page.locator("#reflection").fill("Stale work");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("changed elsewhere");
  await page.getByRole("button", { name: "Discard edits & reload" }).click();
  await expect(page.locator("#reflection")).toHaveValue("Newer other-tab work");
});
