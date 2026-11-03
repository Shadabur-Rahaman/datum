import { test, expect } from "@playwright/test";
import {
  activities,
  computeActivity,
} from "../src/features/lessons/activities";
for (const [id, spec] of Object.entries(activities))
  test(`interactive lesson ${id} computes and persists evidence`, async ({
    page,
  }) => {
    await page.goto(`/datum/#/learn/${id}`);
    const activity = page.getByRole("region", { name: "Lesson activity" });
    await expect(
      activity.getByRole("button", { name: "Run lesson experiment" }),
    ).toBeDisabled();
    await activity
      .getByLabel("Activity parameter", { exact: true })
      .fill(String(spec.max));
    await activity.getByLabel("Activity prediction").selectOption("increase");
    await activity
      .getByRole("button", { name: "Run lesson experiment" })
      .click();
    const expected = computeActivity(id, spec.max).metric;
    await expect(activity.getByText(/Computed result:/)).toContainText(
      expected.toFixed(2),
    );
    await activity
      .getByRole("button", { name: spec.correct, exact: true })
      .click();
    await activity.getByLabel("Applied result").fill(expected.toFixed(2));
    await activity
      .getByLabel("Activity explanation")
      .fill(
        "The parameter changes this calculation; synthetic examples cannot prove causation.",
      );
    await activity
      .getByRole("button", { name: "Check and record activity" })
      .click();
    await expect(activity.getByText(/Activity checks passed/)).toBeVisible();
    await activity
      .getByRole("button", { name: "Save activity", exact: true })
      .click();
    await expect(
      activity.getByText(/Save activity: Saved on this device/),
    ).toBeVisible();
    await page.reload();
    await expect(
      activity.getByText(/1 successful practice checks/),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("chapter practice grades honestly, saves history and retries", async ({
  page,
}) => {
  await page.goto("/datum/#/quiz");
  const arena = page.getByRole("region", { name: "Chapter quiz" });
  await arena.getByLabel("Chapter numeric answer").fill("14");
  await arena.getByRole("button", { name: "Check practice answer" }).click();
  await expect(arena.getByText(/Review · Local practice/)).toBeVisible();
  await arena.getByRole("button", { name: "Save chapter quiz" }).click();
  await expect(
    arena.getByText(/Save chapter quiz: Saved on this device/),
  ).toBeVisible();
  await page.reload();
  await expect(arena.getByText(/Review · Local practice/)).toBeVisible();
  await arena
    .getByRole("button", { name: "Start another chapter attempt" })
    .click();
  await arena.getByLabel("Chapter numeric answer").fill("15");
  await arena.getByRole("button", { name: "Check practice answer" }).click();
  await expect(arena.getByText(/Correct · Local practice/)).toBeVisible();
  await arena.getByLabel("Quiz mode").selectOption("assessment");
  await expect(
    arena.getByRole("button", { name: "Submit chapter assessment" }),
  ).toBeDisabled();
});
test("autosave recovery survives a refresh without clicking Save", async ({
  page,
}) => {
  await page.goto("/datum/#/learn/observations");
  await page
    .locator("#reflection")
    .fill("Autosave keeps this reasoning after a page refresh.");
  await expect(
    page.getByText("Saved on this device.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("#reflection")).toHaveValue(
    "Autosave keeps this reasoning after a page refresh.",
  );
});
test("research history undo and snapshots persist", async ({
  page,
  isMobile,
}) => {
  await page.goto("/datum/#/investigate");
  if (isMobile)
    await page.getByRole("button", { name: "Brief", exact: true }).click();
  await page
    .getByLabel("Your hypothesis", { exact: true })
    .fill("Rain may be associated with longer delivery times.");
  if (isMobile)
    await page.getByRole("button", { name: "Workspace", exact: true }).click();
  await page
    .getByText("Dataset dictionary and research history", { exact: true })
    .click();
  await page.getByLabel("Investigation template").selectOption("rain");
  await page.getByRole("button", { name: "Experiment", exact: true }).click();
  await page.getByLabel("Prediction", { exact: true }).selectOption("increase");
  await page
    .getByRole("button", { name: "Run experiment", exact: true })
    .click();
  await page.getByRole("button", { name: "Save experiment snapshot" }).click();
  await expect(
    page.getByRole("button", { name: "Restore Experiment 1" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save research history", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo configuration change" }).click();
  await expect(page.getByText(/Previous configuration restored/)).toBeVisible();
});
