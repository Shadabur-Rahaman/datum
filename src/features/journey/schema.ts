import { z } from "zod";
import { configSchema } from "../lab/engine";
export const evidenceSchema = z
  .object({
    id: z.string().uuid(),
    createdAt: z.string().datetime({ offset: true }),
    dataset: z.literal("delivery-synthetic"),
    version: z.literal(1),
    seed: z.literal(20261103),
    config: configSchema,
    prediction: z.enum(["increase", "decrease", "same", ""]).default(""),
    hypothesis: z.string().max(1500),
    code: z.string().max(10000),
    finding: z.string().min(30).max(2000),
    limitations: z.string().min(20).max(1500),
    reflection: z.string().max(2000),
  })
  .strict();
export type Evidence = z.infer<typeof evidenceSchema>;
export const notebookSchema = z
  .object({ entries: z.array(evidenceSchema).max(30) })
  .strict();
export const practiceSchema = z
  .object({
    code: z.string().max(10000),
    attempts: z
      .array(
        z
          .object({
            at: z.string().datetime(),
            passed: z.boolean(),
            checks: z.number().int().min(0).max(10),
          })
          .strict(),
      )
      .max(30),
  })
  .strict();
export const quizSessionSchema = z
  .object({
    requestId: z.string().uuid(),
    answers: z.record(
      z.string(),
      z.union([
        z.string().max(200),
        z.array(z.string().max(100)).max(10),
        z.number(),
      ]),
    ),
    cursor: z.number().int().min(0).max(11),
  })
  .strict();
export const navigationSchema = z
  .object({ lastLesson: z.string().max(80) })
  .strict();
export const documentIds = [
  "lab-delivery",
  "evidence-notebook",
  "quiz-delivery",
  "learner-navigation",
  "practice-count",
  "practice-average",
  "practice-clean",
  "practice-groups",
  "practice-spread",
  "practice-error",
];
export const isDocument = (id: string) => documentIds.includes(id);
