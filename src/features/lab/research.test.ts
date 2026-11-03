import { it, expect } from "vitest";
import { researchRubric, researchSchema } from "./research";
import { initialLab, defaultConfig } from "./engine";
it("requires computed observations as well as authored research structure", () => {
  expect(researchRubric(initialLab).some((x) => x.passed)).toBe(false);
  const completed = {
    ...initialLab,
    hypothesis: "Rain may be associated with longer waits.",
    executed: true,
    prediction: "increase" as const,
    explanation: "The observed groups differ in their mean delivery times.",
    limitations: "Distance and rush hour may be confounding factors.",
    reflection: "I need a stronger design to establish causation.",
  };
  expect(researchRubric(completed).every((x) => x.passed)).toBe(true);
  expect(
    researchRubric({ ...completed, executed: false }).every((x) => x.passed),
  ).toBe(false);
});
it("stores bounded recipes and validates every snapshot configuration", () => {
  const item = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    name: "Rain comparison",
    config: defaultConfig,
  };
  expect(
    researchSchema.safeParse({
      history: [],
      snapshots: [item],
      pythonView: "analysis",
    }).success,
  ).toBe(true);
  expect(
    researchSchema.safeParse({
      history: [],
      snapshots: Array(11).fill(item),
      pythonView: "analysis",
    }).success,
  ).toBe(false);
  expect(
    researchSchema.safeParse({
      history: [],
      snapshots: [
        { ...item, config: { ...defaultConfig, sampleSize: 100000 } },
      ],
      pythonView: "analysis",
    }).success,
  ).toBe(false);
});
