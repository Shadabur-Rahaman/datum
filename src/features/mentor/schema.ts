import { z } from "zod";
export const conversationSchema = z
  .object({
    turns: z
      .array(
        z.object({
          at: z.string().datetime(),
          role: z.enum(["tutor", "debugger", "reviewer", "navigator"]),
          question: z.string().max(2000),
          hint: z.string().max(4000),
        }),
      )
      .max(10),
  })
  .strict();
