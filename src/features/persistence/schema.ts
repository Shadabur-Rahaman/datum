import { z } from "zod";
import { lessons } from "../../content/track";
import { labSchema } from "../lab/engine";
import {
  notebookSchema,
  practiceSchema,
  quizSessionSchema,
  navigationSchema,
} from "../journey/schema";
export const lessonBody = z
  .object({ reflection: z.string().max(2000) })
  .strict();
export const missionBody = z
  .object({
    hypothesis: z.string().max(1500),
    code: z.string().max(10000),
    query: z.string().max(200),
    panel: z.enum(["Data", "Chart", "Python"]),
  })
  .strict();
export type LessonBody = z.infer<typeof lessonBody>;
export type MissionBody = z.infer<typeof missionBody>;
export type DraftBody =
  | LessonBody
  | MissionBody
  | z.infer<typeof labSchema>
  | z.infer<typeof notebookSchema>
  | z.infer<typeof practiceSchema>
  | z.infer<typeof quizSessionSchema>
  | z.infer<typeof navigationSchema>;
export const draftSchema = z.object({
  content_id: z.string().max(80),
  content_version: z.literal(1),
  body: z.union([
    lessonBody,
    missionBody,
    labSchema,
    notebookSchema,
    practiceSchema,
    quizSessionSchema,
    navigationSchema,
  ]),
  revision: z.number().int().positive(),
  updated_at: z.string().datetime({ offset: true }),
});
export type Draft = z.infer<typeof draftSchema>;
export function validateBody(id: string, body: unknown): DraftBody {
  if (id === "lab-delivery") return labSchema.parse(body);
  if (id === "evidence-notebook") return notebookSchema.parse(body);
  if (id === "quiz-delivery") return quizSessionSchema.parse(body);
  if (id === "learner-navigation") return navigationSchema.parse(body);
  if (/^practice-(count|average|clean|groups|spread|error)$/.test(id))
    return practiceSchema.parse(body);
  if (id === "delivery-delay") return missionBody.parse(body);
  if (!lessons.some((l) => l.id === id))
    throw new Error("Unknown learning content.");
  return lessonBody.parse(body);
}
export function validateDraft(value: unknown): Draft {
  // PostgREST may represent a composite return as a singleton row array.
  const row = Array.isArray(value) && value.length === 1 ? value[0] : value;
  const draft = draftSchema.parse(row);
  validateBody(draft.content_id, draft.body);
  return draft;
}
