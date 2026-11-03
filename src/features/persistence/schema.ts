import { conversationSchema } from "../mentor/schema";
import { researchSchema } from "../lab/research";
import { chapterSessionSchema } from "../quiz/session";
import { activities } from "../lessons/activities";
import { activitySchema } from "../lessons/schema";
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
  | z.infer<typeof activitySchema>
  | z.infer<typeof chapterSessionSchema>
  | z.infer<typeof researchSchema>
  | z.infer<typeof conversationSchema>
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
    activitySchema,
    chapterSessionSchema,
    researchSchema,
    conversationSchema,
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
  if (
    id.startsWith("lesson-activity-") &&
    lessons.some((l) => id === "lesson-activity-" + l.id)
  ) {
    const parsed = activitySchema.parse(body);
    const spec = activities[id.slice("lesson-activity-".length)];
    if (parsed.parameter < spec.min || parsed.parameter > spec.max)
      throw new Error("Lesson parameter is out of range.");
    return parsed;
  }
  if (id === "quiz-chapters-v22") return chapterSessionSchema.parse(body);
  if (id === "lab-research-v22") return researchSchema.parse(body);
  if (
    [
      "mentor-conversation-v22",
      "mentor-debugger-v22",
      "mentor-navigator-v22",
    ].includes(id)
  )
    return conversationSchema.parse(body);
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
