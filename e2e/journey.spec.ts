import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("living experiment, evidence and draft restore", async ({
  page,
  isMobile,
}) => {
  await page.goto("/datum/#/investigate");
  await expect(
    page.getByRole("button", { name: "Save draft", exact: true }),
  ).toBeEnabled();
  if (isMobile)
    await page.getByRole("button", { name: "Brief", exact: true }).click();
  await page
    .getByLabel("Your hypothesis", { exact: true })
    .fill("Removing extreme durations will reduce the mean.");
  if (isMobile)
    await page.getByRole("button", { name: "Workspace", exact: true }).click();
  await page.getByRole("button", { name: "Experiment", exact: true }).click();
  await page.getByLabel(/Exclude durations above/).fill("60");
  await page.getByLabel("Prediction", { exact: true }).selectOption("decrease");
  await page
    .getByRole("button", { name: "Run experiment", exact: true })
    .click();
  await expect(
    page.getByText(/Your prediction matched the direction/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  await page
    .getByLabel("Finding", { exact: true })
    .fill("The mean fell after removing deliveries longer than sixty minutes.");
  await page
    .getByLabel("Limitations", { exact: true })
    .fill("This removes actual long waits and changes the population.");
  await page
    .getByLabel("Reflection", { exact: true })
    .fill("A lower mean alone is not evidence of better service.");
  await page.getByRole("button", { name: "Save finding to notebook" }).click();
  await expect(
    page.getByText(/Evidence saved with reproducible/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Experiment", exact: true }).click();
  await expect(
    page.getByText(/Your prediction matched the direction/),
  ).toBeVisible();
  await page.goto("/datum/#/notebook");
  await expect(page.getByLabel("Finding", { exact: true })).toHaveValue(
    "The mean fell after removing deliveries longer than sixty minutes.",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Markdown" }).click();
  const file = await download;
  const markdown = await readFile((await file.path())!, "utf8");
  expect(markdown).toContain("delivery-synthetic v1, seed 20261103");
  expect(markdown).toContain('"outlierCap": 60');
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reopen experiment" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The Delivery Delay Mystery",
  );
  await page.getByRole("button", { name: "Experiment", exact: true }).click();
  await expect(
    page.getByText(/Your prediction matched the direction/),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("real Python executes, reports errors, times out and recovers", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto("/datum/#/practice");
  const code = page.getByLabel("Python code", { exact: true });
  await code.fill(
    'def solve(values):\n    return sum(v is not None for v in values)\nprint("REAL_PYTHON_OK")',
  );
  await page.getByRole("button", { name: "Run practice checks" }).click();
  await expect(page.getByLabel("Python console")).toContainText(
    "REAL_PYTHON_OK",
    { timeout: 120000 },
  );
  await expect(page.getByText("Passed · Missing and zero: 3")).toBeVisible();
  await code.fill("print(unknown_name)");
  await page.getByRole("button", { name: "Run practice checks" }).click();
  await expect(page.getByLabel("Python console")).toContainText("NameError", {
    timeout: 60000,
  });
  await code.fill("while True:\n    pass");
  await page.getByRole("button", { name: "Run practice checks" }).click();
  await expect(page.getByLabel("Python console")).toContainText(
    "Execution stopped after 10 seconds",
    { timeout: 60000 },
  );
  await code.fill(
    'import pandas as pd\nimport numpy as np\nprint("PACKAGES_OK", pd.Series([10,20,30]).mean(), np.std([7,7,7]))',
  );
  await page.getByRole("button", { name: "Run practice checks" }).click();
  await expect(page.getByLabel("Python console")).toContainText(
    "PACKAGES_OK 20.0 0.0",
    { timeout: 120000 },
  );
});
test("guest quiz answers survive refresh without fabricated grading", async ({
  page,
}) => {
  await page.goto("/datum/#/quiz");
  await page.getByLabel("One delivery", { exact: true }).check();
  await page.getByRole("button", { name: "Next question" }).click();
  await page.getByLabel("Weather", { exact: true }).check();
  await page.getByLabel("Rush-hour flag", { exact: true }).check();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Weather", { exact: true })).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Submit assessment" }),
  ).toBeDisabled();
  await expect(
    page.getByText(/no score will be invented offline/),
  ).toBeVisible();
});
test("unsaved navigation recovery and interactive lesson feedback", async ({
  page,
  isMobile,
}) => {
  await page.goto("/datum/#/learn/hypotheses");
  await page.getByLabel("Lesson prediction").selectOption("decrease");
  await page.getByRole("button", { name: "Test lesson prediction" }).click();
  await expect(page.getByText(/Your direction matched/)).toBeVisible();
  await page.getByRole("button", { name: "True", exact: true }).click();
  await expect(page.getByText(/Reconsider the comparison/)).toBeVisible();
  await page
    .locator("#reflection")
    .fill("Unsaved reasoning retained during navigation.");
  if (isMobile)
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Learn", exact: true }).click();
  await page.getByRole("link", { name: /From hunch to hypothesis/ }).click();
  await expect(page.locator("#reflection")).toHaveValue(
    "Unsaved reasoning retained during navigation.",
  );
});
test("Monaco loads on demand and all six canonical challenge solutions execute", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(180000);
  await page.goto("/datum/#/practice");
  if (!isMobile) {
    await page.getByRole("button", { name: "Use Monaco editor" }).click();
    await expect(page.locator(".monaco-editor").first()).toBeVisible({
      timeout: 20000,
    });
    await page
      .getByRole("button", { name: "Use accessible text editor" })
      .click();
  }
  const solutions = [
    "def solve(values):\n    return sum(v is not None for v in values)",
    "def solve(values):\n    clean = [v for v in values if v is not None]\n    return sum(clean)/len(clean) if clean else None",
    "import pandas as pd\ndef solve(values):\n    return pd.Series(values).dropna().tolist()",
    'import pandas as pd\ndef solve(records):\n    df = pd.DataFrame(records)\n    x = df.loc[df.weather == "Rain", "duration"].dropna()\n    return x.mean() if len(x) else None',
    "import numpy as np\ndef solve(values):\n    return float(np.std(values))",
    "def solve(values):\n    return values[-1] if values else None",
  ];
  for (let i = 0; i < 6; i++) {
    await page
      .getByRole("button", { name: new RegExp("^" + (i + 1) + "\\. ") })
      .click();
    await page.getByLabel("Python code", { exact: true }).fill(solutions[i]);
    await page.getByRole("button", { name: "Run practice checks" }).click();
    await expect(page.getByText(/^Passed ·/)).toHaveCount(2, {
      timeout: 120000,
    });
  }
});
