import { Link } from "react-router-dom";
import { PageHeading } from "../components/ui/shared";
import { useJourney } from "../features/journey/useJourney";
import { challenges } from "../features/python/challenges";
import { practiceSchema, notebookSchema } from "../features/journey/schema";
export function Skills() {
  const { drafts, quizzes, loading, error } = useJourney();
  const evidence = notebookSchema.safeParse(
    drafts.find((d) => d.content_id === "evidence-notebook")?.body,
  );
  const recent = quizzes.slice(0, 5).flatMap((q) => q.feedback ?? []);
  return (
    <>
      <PageHeading
        eyebrow="SKILL DNA / EVIDENCE, NOT PAGE VIEWS"
        title="Skill DNA"
        description="Verified quiz evidence and self-directed practice are shown separately."
      />
      {loading ? (
        <p role="status">Loading evidence…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <section className="panel lesson-body">
            <h2>Recent verified assessment evidence</h2>
            <p>
              Last five graded attempts. A correct response is evidence for a
              specific objective, not proof of general mastery.
            </p>
            {!quizzes.length ? (
              <p>
                No verified assessments yet.{" "}
                <Link className="text-link" to="/quiz">
                  Open Quiz Arena
                </Link>
              </p>
            ) : (
              [...new Set(recent.map((r) => r.skill))].map((skill) => {
                const rows = recent.filter((r) => r.skill === skill),
                  correct = rows.filter((r) => r.correct).length;
                return (
                  <p key={skill}>
                    {skill}: {correct}/{rows.length} correct ·{" "}
                    {rows.length - correct} mistakes to revisit
                  </p>
                );
              })
            )}
          </section>
          <section className="panel lesson-body">
            <h2>Browser practice · unverified</h2>
            {challenges.map((c) => {
              const p = practiceSchema.safeParse(
                drafts.find((d) => d.content_id === "practice-" + c.id)?.body,
              );
              const attempts = p.success ? p.data.attempts : [];
              return (
                <p key={c.id}>
                  {c.title}: {attempts.length} runs ·{" "}
                  {attempts.filter((a) => a.passed).length} passed · Latest:{" "}
                  {attempts.length
                    ? attempts.at(-1)!.passed
                      ? "passed"
                      : "needs review"
                    : "not attempted"}
                </p>
              );
            })}
          </section>
          <section className="panel lesson-body">
            <h2>Investigation evidence</h2>
            <p>
              {evidence.success ? evidence.data.entries.length : 0} saved
              findings with dataset and limitation references. These are
              learner-authored claims, not verified scores.
            </p>
            <Link className="text-link" to="/notebook">
              Review the evidence
            </Link>
          </section>
        </>
      )}
    </>
  );
}
