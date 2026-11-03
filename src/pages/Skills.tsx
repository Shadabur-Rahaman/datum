import { Recommendation } from "../features/journey/Recommendation";
import { mastery, recommend } from "../features/journey/recommendations";
import { activitySchema } from "../features/lessons/schema";
import { lessons } from "../content/track";
import { lazy, Suspense } from "react";
const Mentor = lazy(() => import("../features/mentor/Mentor"));
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
          <Recommendation drafts={drafts} quizzes={quizzes} />
          <section className="panel lesson-body">
            <h2>Skill graph</h2>
            <p>
              Data literacy → Python → Data cleaning → Visual reasoning →
              Statistical reasoning → Evaluation
            </p>
            <p>This describes learning dependencies, not a learner ranking.</p>
            {mastery(quizzes).map((item) => (
              <div key={item.skill}>
                <h3>
                  {item.skill} · {item.state}
                </h3>
                <p>{item.reason}</p>
              </div>
            ))}
          </section>
          <section className="panel lesson-body">
            <h2>Interactive lesson evidence · unverified</h2>
            {lessons.map((lesson) => {
              const parsed = activitySchema.safeParse(
                drafts.find(
                  (d) => d.content_id === "lesson-activity-" + lesson.id,
                )?.body,
              );
              return (
                <p key={lesson.id}>
                  <Link to={"/learn/" + lesson.id}>{lesson.title}</Link>:{" "}
                  {parsed.success
                    ? `${parsed.data.attempts.filter((a) => a.passed).length} passing checks / ${parsed.data.attempts.length} attempts · ${parsed.data.hints} hints used`
                    : "No recorded checks"}
                </p>
              );
            })}
          </section>
          <section className="panel lesson-body">
            <h2>Recent activity timeline</h2>
            <p>
              Saved work is participation; only server-graded attempts count
              toward verified skill indicators.
            </p>
            <ol>
              {[
                ...drafts.map((d) => ({
                  id: d.content_id,
                  at: d.updated_at,
                  label: `Saved ${d.content_id} · unverified work`,
                })),
                ...quizzes.map((q) => ({
                  id: q.id,
                  at: q.created_at,
                  label: `Verified quiz: ${Math.round((q.verified_score ?? 0) * 100)}%`,
                })),
              ]
                .sort((a, b) => b.at.localeCompare(a.at))
                .slice(0, 20)
                .map((event) => (
                  <li key={event.id}>
                    {new Date(event.at).toLocaleString()} · {event.label}
                  </li>
                ))}
            </ol>
          </section>
          <details className="panel lesson-body">
            <summary>Ask the learning navigator</summary>
            <Suspense fallback={<p>Loading navigator…</p>}>
              <Mentor
                defaultRole="navigator"
                context={{
                  recommendation: recommend(drafts, quizzes),
                  verified: mastery(quizzes),
                }}
              />
            </Suspense>
          </details>
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
