import { z } from "zod";
export const DATASET = {
  id: "delivery-synthetic",
  version: 1,
  seed: 20261103,
  count: 1000,
  method:
    "Mulberry32; duration = preparation + 3.1×distance + rain effect + rush effect + bounded noise. Every 137th record has an extra delay. Missingness is more frequent in rain.",
  limitations:
    "Synthetic educational records, not a real company. Designed associations are not empirical causal evidence. Missingness is not random.",
};
export type Delivery = {
  id: string;
  distance: number;
  weather: "Clear" | "Rain" | "Cloudy";
  rush: boolean;
  preparation: number;
  duration: number | null;
  missing: boolean;
  complaint: boolean;
};
export function random(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function generate(seed = DATASET.seed, count = 1000): Delivery[] {
  const r = random(seed);
  return Array.from({ length: count }, (_, i) => {
    const distance = Math.round((1 + r() * 14) * 10) / 10,
      weather = r() < 0.3 ? "Rain" : r() < 0.3 ? "Cloudy" : "Clear",
      rush = r() < 0.4,
      preparation = Math.round(6 + r() * 18);
    const duration = Math.round(
      preparation +
        distance * 3.1 +
        (weather === "Rain" ? 12 : 0) +
        (rush ? 14 : 0) +
        (r() - 0.5) * 12 +
        (i % 137 === 0 ? 90 : 0),
    );
    const missing = r() < (weather === "Rain" ? 0.12 : 0.035);
    const complaint = duration > 65 && r() < 0.7;
    return {
      id: `DL-${String(i + 1).padStart(4, "0")}`,
      distance,
      weather,
      rush,
      preparation,
      duration: missing ? null : duration,
      missing,
      complaint,
    };
  });
}
export const original = generate();
export const configSchema = z
  .object({
    weather: z.enum(["All", "Clear", "Rain", "Cloudy"]),
    rush: z.enum(["All", "Yes", "No"]),
    maxDistance: z.number().min(1).max(15),
    missing: z.enum(["keep", "drop", "median"]),
    outlierCap: z.number().min(30).max(240),
    sampleSize: z.number().int().min(50).max(1000),
  })
  .strict();
export type Config = z.infer<typeof configSchema>;
export const defaultConfig: Config = {
  weather: "All",
  rush: "All",
  maxDistance: 15,
  missing: "keep",
  outlierCap: 240,
  sampleSize: 1000,
};
export function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b),
    m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}
export function stats(rows: Delivery[]) {
  const values = rows.flatMap((r) => (r.duration === null ? [] : [r.duration]));
  return {
    rows: rows.length,
    observed: values.length,
    missing: rows.length - values.length,
    mean: values.length
      ? values.reduce((s, n) => s + n, 0) / values.length
      : null,
    median: median(values),
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    complaints: rows.filter((r) => r.complaint).length,
  };
}
export function transform(rows: Delivery[], config: Config) {
  configSchema.parse(config);
  let result = rows
    .filter(
      (r) =>
        (config.weather === "All" || r.weather === config.weather) &&
        (config.rush === "All" || r.rush === (config.rush === "Yes")) &&
        r.distance <= config.maxDistance,
    )
    .map((r) => ({ ...r }));
  const fill = median(
    result.flatMap((r) => (r.duration === null ? [] : [r.duration])),
  );
  if (config.missing === "drop")
    result = result.filter((r) => r.duration !== null);
  if (config.missing === "median" && fill !== null)
    result = result.map((r) => ({ ...r, duration: r.duration ?? fill }));
  result = result.filter(
    (r) => r.duration === null || r.duration <= config.outlierCap,
  );
  const rng = random(91);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, config.sampleSize);
}
export const predictionSchema = z.enum(["increase", "decrease", "same"]);
export type Prediction = z.infer<typeof predictionSchema>;
export function runExperiment(config: Config, prediction: Prediction) {
  configSchema.parse(config);
  predictionSchema.parse(prediction);
  const before = stats(original),
    after = stats(transform(original, config));
  const difference =
    before.mean === null || after.mean === null
      ? null
      : after.mean - before.mean;
  const direction =
    difference === null
      ? null
      : Math.abs(difference) < 0.01
        ? "same"
        : difference > 0
          ? "increase"
          : "decrease";
  return {
    before,
    after,
    difference,
    direction,
    predictionCorrect: direction === null ? null : direction === prediction,
  };
}
export const labSchema = z
  .object({
    hypothesis: z.string().max(1500),
    code: z.string().max(10000),
    config: configSchema,
    prediction: z.union([predictionSchema, z.literal("")]),
    executed: z.boolean(),
    explanation: z.string().max(2000),
    limitations: z.string().max(1500),
    reflection: z.string().max(2000),
    stage: z.enum([
      "BRIEF",
      "HYPOTHESIS",
      "EXPLORE",
      "EXPERIMENT",
      "EXPLAIN",
      "REFLECT",
      "COMPLETE",
    ]),
  })
  .strict();
export type LabState = z.infer<typeof labSchema>;
export const initialLab: LabState = {
  hypothesis: "",
  code: 'import pandas as pd\n\n# rows contains the current transformed synthetic dataset\ndf = pd.DataFrame(rows)\nprint(df.groupby("weather")["duration"].mean())',
  config: defaultConfig,
  prediction: "",
  executed: false,
  explanation: "",
  limitations: "",
  reflection: "",
  stage: "BRIEF",
};
export function nextStage(state: LabState): LabState["stage"] {
  switch (state.stage) {
    case "BRIEF":
      return "HYPOTHESIS";
    case "HYPOTHESIS":
      if (state.hypothesis.trim().length >= 20) return "EXPLORE";
      break;
    case "EXPLORE":
      return "EXPERIMENT";
    case "EXPERIMENT":
      if (state.executed && state.prediction) return "EXPLAIN";
      break;
    case "EXPLAIN":
      if (
        state.explanation.trim().length >= 30 &&
        state.limitations.trim().length >= 20
      )
        return "REFLECT";
      break;
    case "REFLECT":
      if (state.reflection.trim().length >= 20) return "COMPLETE";
      break;
  }
  throw new Error("Complete the evidence requirements for this step first.");
}
export function csv(rows: Delivery[]) {
  return (
    "order_id,distance_km,weather,rush_hour,preparation_min,duration_min,originally_missing,complaint\n" +
    rows
      .map((r) =>
        [
          r.id,
          r.distance,
          r.weather,
          r.rush,
          r.preparation,
          r.duration ?? "",
          r.missing,
          r.complaint,
        ].join(","),
      )
      .join("\n")
  );
}
