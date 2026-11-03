import type { QuizAttempt } from "./useJourney";
import type { Draft } from "../persistence/schema";
import { activitySchema } from "../lessons/schema";
import { practiceSchema } from "./schema";
import { lessons } from "../../content/track";
export function mastery(quizzes: QuizAttempt[], now = Date.now()) {
  const latest = new Map<
    string,
    { id: string; skill: string; correct: boolean }
  >();
  for (const q of [...quizzes].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )) {
    const age = now - Date.parse(q.created_at);
    if (q.verified_score === null || age < 0 || age > 30 * 86400000) continue;
    for (const f of q.feedback ?? [])
      if (!latest.has(f.id)) latest.set(f.id, f);
  }
  return [...new Set([...latest.values()].map((x) => x.skill))].map((skill) => {
    const rows = [...latest.values()].filter((x) => x.skill === skill),
      correct = rows.filter((x) => x.correct).length;
    const state = rows.some((x) => !x.correct)
      ? "Needs review"
      : rows.length >= 4 && correct / rows.length >= 0.8
        ? "Competent on assessed objectives"
        : "Building evidence";
    return {
      skill,
      correct,
      total: rows.length,
      state,
      reason: `${correct}/${rows.length} distinct objectives correct on their latest verified response within 30 days. Competence requires at least four objectives, 80% correct and no outstanding latest mistake.`,
    };
  });
}
export function recommend(drafts: Draft[], quizzes: QuizAttempt[]) {
  const weak = mastery(quizzes).find((x) => x.state === "Needs review");
  if (weak)
    return { title: `Revisit ${weak.skill}`, reason: weak.reason, to: "/quiz" };
  for (const draft of drafts.filter((d) =>
    d.content_id.startsWith("practice-"),
  )) {
    const p = practiceSchema.safeParse(draft.body);
    if (p.success && p.data.attempts.at(-1)?.passed === false)
      return {
        title: "Retry your recent Python exercise",
        reason:
          "Your latest browser practice run did not pass its checks. This is unverified practice feedback.",
        to: "/practice?challenge=" + draft.content_id.slice(9),
      };
  }
  for (const lesson of lessons) {
    const activity = activitySchema.safeParse(
      drafts.find((d) => d.content_id === "lesson-activity-" + lesson.id)?.body,
    );
    if (!activity.success || !activity.data.attempts.some((a) => a.passed))
      return {
        title: `Explore ${lesson.title}`,
        reason:
          "No passing interactive practice record is saved for this lesson. Opening a page or writing a reflection does not establish mastery.",
        to: "/learn/" + lesson.id,
      };
  }
  return {
    title: "Test your chapter knowledge",
    reason:
      "Interactive practice is recorded across the curriculum. A verified assessment provides independent grading when cloud access is configured.",
    to: "/quiz",
  };
}
