import { z } from "zod";
import {
  configSchema,
  stats,
  transform,
  original,
  type LabState,
} from "./engine";
export const researchSchema = z
  .object({
    history: z
      .array(z.object({ at: z.string().datetime(), config: configSchema }))
      .max(30),
    snapshots: z
      .array(
        z.object({
          id: z.string().uuid(),
          at: z.string().datetime(),
          name: z.string().max(80),
          config: configSchema,
        }),
      )
      .max(10),
    pythonView: z.enum(["analysis", "original"]),
  })
  .strict();
export type Research = z.infer<typeof researchSchema>;
export function researchRubric(s: LabState) {
  const summary = stats(transform(original, s.config));
  return [
    {
      label: "Testable hypothesis recorded (20+ characters)",
      passed: s.hypothesis.trim().length >= 20,
    },
    {
      label: "Prediction and executed experiment recorded",
      passed: s.executed && !!s.prediction,
    },
    {
      label: "Computed observations and supporting group chart available",
      passed: s.executed && summary.observed > 0,
    },
    {
      label: "Conclusion recorded (30+ characters)",
      passed: s.explanation.trim().length >= 30,
    },
    {
      label: "Limitations recorded (20+ characters)",
      passed: s.limitations.trim().length >= 20,
    },
    {
      label: "Reflection recorded (20+ characters)",
      passed: s.reflection.trim().length >= 20,
    },
  ];
}
