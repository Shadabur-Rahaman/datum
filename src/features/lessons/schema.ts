import { z } from "zod";
export const activitySchema = z
  .object({
    parameter: z.number().finite(),
    prediction: z.enum(["", "increase", "decrease", "same"]),
    ran: z.boolean(),
    answer: z.string().max(200),
    applied: z.string().max(30),
    explanation: z.string().max(2000),
    hints: z.number().int().min(0).max(1000),
    attempts: z
      .array(
        z
          .object({
            at: z.string().datetime(),
            parameter: z.number(),
            knowledgePassed: z.boolean(),
            appliedPassed: z.boolean(),
            reflectionPresent: z.boolean(),
            passed: z.boolean(),
          })
          .strict(),
      )
      .max(30),
  })
  .strict();
export type ActivityState = z.infer<typeof activitySchema>;
