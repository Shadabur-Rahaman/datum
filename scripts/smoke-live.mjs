// Isolated guest context: never touches an existing browser profile or account.
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const base =
  process.env.DATUM_BASE_URL ?? "https://shadabur-rahaman.github.io/datum/";
const metadata = await fetch(base + "build-info.json?verify=" + Date.now(), {
  cache: "no-store",
});
assert.equal(metadata.status, 200);
const build = await metadata.json();
if (process.env.EXPECTED_COMMIT)
  assert.equal(build.commit, process.env.EXPECTED_COMMIT);
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  for (const route of [
    "/",
    "/learn",
    "/learn/hypotheses",
    "/investigate",
    "/practice",
    "/quiz",
    "/skills",
    "/notebook",
    "/settings",
  ]) {
    await page.goto(base + "#" + route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  await page.goto(base + "#/practice");
  await page
    .getByLabel("Python code", { exact: true })
    .fill(
      'def solve(values):\n    return sum(v is not None for v in values)\nprint("LIVE_REAL_PYTHON")',
    );
  await page.getByRole("button", { name: "Run practice checks" }).click();
  await expect(page.getByLabel("Python console")).toContainText(
    "LIVE_REAL_PYTHON",
    { timeout: 120000 },
  );
  await expect(page.getByText(/^Passed ·/)).toHaveCount(2);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Python code", { exact: true })).toHaveValue(
    /LIVE_REAL_PYTHON/,
  );
  await page.goto(base + "#/investigate");
  await page
    .getByLabel("Your hypothesis", { exact: true })
    .fill("Removing extreme waits should reduce the mean.");
  await page.getByRole("button", { name: "Experiment", exact: true }).click();
  await page.getByLabel(/Exclude durations above/).fill("60");
  await page.getByLabel("Prediction", { exact: true }).selectOption("decrease");
  await page
    .getByRole("button", { name: "Run experiment", exact: true })
    .click();
  await expect(
    page.getByText(/Your prediction matched the direction/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Experiment", exact: true }).click();
  await expect(
    page.getByText(/Your prediction matched the direction/),
  ).toBeVisible();
  await page.goto(base + "#/quiz");
  await page.getByLabel("One delivery", { exact: true }).check();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("One delivery", { exact: true })).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Submit assessment" }),
  ).toBeDisabled();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        build,
        routes: 9,
        python: "real execution and two checks passed",
        experiment: "transformed and restored",
        quiz: "guest answers restored; cloud grading unavailable",
        browserErrors: errors.length,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
