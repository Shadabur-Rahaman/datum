import { it, expect } from "vitest";
import { activities, computeActivity, evaluateActivity } from "./activities";
import { lessons } from "../../content/track";
it("covers all twelve curriculum lessons with distinct bounded computed activities", () => {
  expect(Object.keys(activities).sort()).toEqual(
    lessons.map((l) => l.id).sort(),
  );
  for (const [id, a] of Object.entries(activities)) {
    expect(a.objective.length).toBeGreaterThan(20);
    expect(a.analogy.length).toBeGreaterThan(40);
    for (const p of [a.min, a.initial, a.max])
      expect(Number.isFinite(computeActivity(id, p).metric)).toBe(true);
    expect(() => computeActivity(id, a.max + 1)).toThrow();
  }
});
it.each([
  ["observations", 4, 12],
  ["python-basics", 3, 22],
  ["processing", 40, 2],
  ["missing", 0, 20],
  ["summary", 100, 40],
  ["uncertainty", 0, 20],
  ["uncertainty", 10, 80],
  ["features", 100, 0],
  ["evaluation", 5, 0],
])("computes %s from known examples", (id, p, answer) =>
  expect(computeActivity(String(id), Number(p)).metric).toBe(Number(answer)),
);
it("histogram counts preserve all observations and charts distinguish units", () => {
  expect(
    computeActivity("distributions", 140).values.reduce((a, b) => a + b, 0),
  ).toBe(5);
  expect(computeActivity("charts", 0).metric).toBeCloseTo(100 / 6);
  expect(computeActivity("charts", 30).metric).toBeCloseTo(100 / 3);
});
it("never completes from visits, wrong answers or numeric-only reflection", () => {
  const state = {
    parameter: 3,
    prediction: "same",
    ran: true,
    answer: "No",
    applied: "22",
    explanation: "The arithmetic changes with rate; traffic is omitted.",
  };
  expect(evaluateActivity("python-basics", state).passed).toBe(true);
  expect(
    evaluateActivity("python-basics", { ...state, ran: false }).passed,
  ).toBe(false);
  expect(
    evaluateActivity("python-basics", { ...state, answer: "Yes" }).passed,
  ).toBe(false);
  expect(
    evaluateActivity("python-basics", { ...state, applied: "999" }).passed,
  ).toBe(false);
  expect(
    evaluateActivity("python-basics", { ...state, explanation: "" }).passed,
  ).toBe(false);
});
