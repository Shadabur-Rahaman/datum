import { describe, it, expect } from "vitest";
import {
  generate,
  original,
  defaultConfig,
  transform,
  stats,
  median,
  runExperiment,
  nextStage,
  initialLab,
} from "./engine";
describe("living dataset and prediction engine", () => {
  it("generates 1000 reproducible independent records", () => {
    expect(generate()).toEqual(original);
    expect(new Set(original.map((r) => r.id)).size).toBe(1000);
    expect(generate(12)).not.toEqual(original);
    expect(original.some((r) => r.missing)).toBe(true);
  });
  it("computes summaries from exact fixtures including empty data", () => {
    expect(median([1, 2, 100, 4])).toBe(3);
    expect(stats([]).mean).toBeNull();
    const rows = original
      .slice(0, 3)
      .map((r, i) => ({ ...r, duration: [10, 20, null][i] }));
    expect(stats(rows)).toMatchObject({
      rows: 3,
      observed: 2,
      missing: 1,
      mean: 15,
      median: 15,
    });
  });
  it("filters, drops and imputes without mutating source", () => {
    const copy = JSON.stringify(original);
    const filtered = transform(original, {
      ...defaultConfig,
      weather: "Rain",
      missing: "drop",
    });
    expect(
      filtered.every((r) => r.weather === "Rain" && r.duration !== null),
    ).toBe(true);
    expect(
      transform(original, { ...defaultConfig, missing: "median" }).every(
        (r) => r.duration !== null,
      ),
    ).toBe(true);
    expect(JSON.stringify(original)).toBe(copy);
  });
  it("samples reproducibly and handles no observations", () => {
    expect(
      transform(original, { ...defaultConfig, sampleSize: 50 }),
    ).toHaveLength(50);
    expect(transform(original, { ...defaultConfig, sampleSize: 50 })).toEqual(
      transform(original, { ...defaultConfig, sampleSize: 50 }),
    );
  });
  it("requires a prediction and calculates actual before-after changes", () => {
    expect(() => runExperiment(defaultConfig, "" as never)).toThrow();
    const result = runExperiment(
      { ...defaultConfig, outlierCap: 60 },
      "decrease",
    );
    expect(result.difference).toBeLessThan(0);
    expect(result.predictionCorrect).toBe(true);
  });
  it("guards the investigation sequence", () => {
    expect(nextStage(initialLab)).toBe("HYPOTHESIS");
    expect(() => nextStage({ ...initialLab, stage: "EXPERIMENT" })).toThrow();
    expect(() =>
      nextStage({ ...initialLab, stage: "EXPLAIN", explanation: "short" }),
    ).toThrow();
    expect(
      nextStage({
        ...initialLab,
        stage: "REFLECT",
        reflection: "A sufficiently detailed reflection.",
      }),
    ).toBe("COMPLETE");
  });
});
