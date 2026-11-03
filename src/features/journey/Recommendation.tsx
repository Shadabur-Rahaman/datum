import { Link } from "react-router-dom";
import type { Draft } from "../persistence/schema";
import type { QuizAttempt } from "./useJourney";
import { recommend } from "./recommendations";
export function Recommendation({
  drafts,
  quizzes,
}: {
  drafts: Draft[];
  quizzes: QuizAttempt[];
}) {
  const next = recommend(drafts, quizzes);
  return (
    <section className="panel lesson-body">
      <h2>Suggested next step</h2>
      <Link className="text-link" to={next.to}>
        {next.title}
      </Link>
      <p>{next.reason}</p>
      <p className="small muted">
        Rule-based recommendation. Works without AI.
      </p>
    </section>
  );
}
