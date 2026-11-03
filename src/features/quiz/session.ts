import { z } from "zod";
export const chapterSessionSchema = z
  .object({
    chapter: z.number().int().min(0).max(5),
    mode: z.enum(["assessment", "practice"]),
    requestId: z.string().uuid(),
    cursor: z.number().int().min(0).max(5),
    answers: z.record(
      z.string().max(40),
      z.union([
        z.number().finite(),
        z.string().max(200),
        z.array(z.string().max(100)).max(4),
      ]),
    ),
    startedAt: z.number().finite().nonnegative(),
    timed: z.boolean(),
    practiceHistory: z
      .array(
        z.object({
          id: z.string().uuid(),
          at: z.string().datetime(),
          chapter: z.number().int().min(0).max(5),
          correct: z.boolean(),
          answer: z.number().finite(),
        }),
      )
      .max(30),
  })
  .strict();
export type ChapterSession = z.infer<typeof chapterSessionSchema>;
export function gradePractice(answer: number, expected: number) {
  return Number.isFinite(answer) && Math.abs(answer - expected) <= 0.001;
}
