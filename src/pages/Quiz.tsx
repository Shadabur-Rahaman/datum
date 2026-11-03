import { useEffect, useMemo, useState } from "react";
import { questions } from "../features/quiz/questions";
import { PageHeading, Badge } from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { useDraft } from "../features/persistence/useDraft";
import { DraftActions } from "../features/persistence/DraftActions";
import { useAuth } from "../features/auth/AuthProvider";
import { supabase } from "../services/supabase";
import { useJourney, type QuizAttempt } from "../features/journey/useJourney";
import { quizSessionSchema } from "../features/journey/schema";
import { random } from "../features/lab/engine";
import type { z } from "zod";
export function Quiz() {
  const saved = useDraft<z.infer<typeof quizSessionSchema>>("quiz-delivery", {
      requestId: crypto.randomUUID(),
      answers: {},
      cursor: 0,
    }),
    { user } = useAuth(),
    history = useJourney(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState<QuizAttempt | null>(null);
  const s = saved.body,
    q = questions[s.cursor];
  useEffect(() => {
    const completed = history.quizzes.find((a) => a.request_id === s.requestId);
    if (completed) setResult(completed);
  }, [history.quizzes, s.requestId]);
  const options = useMemo(() => {
    const rng = random(
      [...(s.requestId + q.id)].reduce((a, c) => a + c.charCodeAt(0), 0),
    );
    return q.options
      .map((o) => ({ o, n: rng() }))
      .sort((a, b) => a.n - b.n)
      .map((x) => x.o);
  }, [q, s.requestId]);
  const locked = busy || saved.blocked || !!result;
  async function submit() {
    if (!supabase || !user) return;
    setBusy(true);
    setError("");
    try {
      if (!(await saved.save()))
        throw new Error("Save your answers successfully before submitting.");
      const { data, error } = await supabase.rpc("grade_delivery_quiz", {
        p_owner: user.id,
        p_request_id: s.requestId,
        p_answers: s.answers,
      });
      if (error) throw error;
      setResult(Array.isArray(data) ? data[0] : data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Grading failed. Your answers remain here; retry with the same request.",
      );
    } finally {
      setBusy(false);
    }
  }
  function answer(value: string | string[] | number) {
    const answers = { ...s.answers };
    if (Array.isArray(value) && !value.length) delete answers[q.id];
    else answers[q.id] = value;
    saved.update({ answers });
  }
  return (
    <>
      <PageHeading
        eyebrow="QUIZ ARENA / DATA DETECTIVE"
        title="Quiz Arena"
        description="Twelve objectives. Stable answer identities. Server-graded feedback."
      />
      {(!supabase || !user) && (
        <p className="preview-note">
          You can answer and save a guest session. Verified grading requires a
          configured cloud account; no score will be invented offline.
        </p>
      )}
      <section className="panel lesson-body">
        <Badge>
          {q.difficulty} · {q.skill}
        </Badge>
        <p>
          Question {s.cursor + 1} / {questions.length} · {q.objective}
        </p>
        <h2>{q.prompt}</h2>
        <fieldset disabled={locked}>
          <legend>
            {q.kind === "multi" ? "Select all that apply" : "Your answer"}
          </legend>
          {q.kind === "numeric" ? (
            <input
              aria-label="Numeric answer"
              type="number"
              step="any"
              value={
                typeof s.answers[q.id] === "number"
                  ? (s.answers[q.id] as number)
                  : ""
              }
              onChange={(e) => {
                if (e.target.value === "") {
                  const copy = { ...s.answers };
                  delete copy[q.id];
                  saved.update({ answers: copy });
                } else if (Number.isFinite(Number(e.target.value)))
                  answer(Number(e.target.value));
              }}
            />
          ) : (
            options.map((o) => (
              <label className="quiz-option" key={o.id}>
                <input
                  type={q.kind === "multi" ? "checkbox" : "radio"}
                  name={q.id}
                  checked={
                    q.kind === "multi"
                      ? Array.isArray(s.answers[q.id]) &&
                        (s.answers[q.id] as string[]).includes(o.id)
                      : s.answers[q.id] === o.id
                  }
                  onChange={() => {
                    if (q.kind === "multi") {
                      const old = Array.isArray(s.answers[q.id])
                        ? (s.answers[q.id] as string[])
                        : [];
                      answer(
                        old.includes(o.id)
                          ? old.filter((x) => x !== o.id)
                          : [...old, o.id],
                      );
                    } else answer(o.id);
                  }}
                />
                {o.label}
              </label>
            ))
          )}
        </fieldset>
        <div className="action-row">
          <Button
            variant="outline"
            disabled={s.cursor === 0 || locked}
            onClick={() => saved.update({ cursor: s.cursor - 1 })}
          >
            Previous question
          </Button>
          <Button
            variant="outline"
            disabled={s.cursor === 11 || locked}
            onClick={() => saved.update({ cursor: s.cursor + 1 })}
          >
            Next question
          </Button>
          <Button
            disabled={
              locked ||
              !user ||
              !supabase ||
              Object.keys(s.answers).length !== 12
            }
            onClick={() => void submit()}
          >
            {busy ? "Grading…" : "Submit assessment"}
          </Button>
        </div>
        <p>{Object.keys(s.answers).length} / 12 answered</p>
        <DraftActions draft={saved} />
        {error && <p role="alert">{error}</p>}
        {result && (
          <>
            <h2>
              Verified score: {Math.round((result.verified_score ?? 0) * 100)}%
            </h2>
            {result.feedback?.map((f) => (
              <p key={f.id}>
                <strong>
                  {f.correct ? "Correct" : "Review"} ·{" "}
                  {questions.find((q) => q.id === f.id)?.objective}
                </strong>
                <br />
                {f.explanation}
              </p>
            ))}
            <Button
              onClick={() => {
                saved.update({
                  requestId: crypto.randomUUID(),
                  answers: {},
                  cursor: 0,
                });
                setResult(null);
              }}
            >
              Start a new attempt
            </Button>
          </>
        )}
      </section>
      <section className="panel lesson-body">
        <h2>Account attempt history</h2>
        {history.error ? (
          <p role="alert">{history.error}</p>
        ) : history.loading ? (
          <p>Loading history…</p>
        ) : history.quizzes.length ? (
          history.quizzes.map((a) => (
            <p key={a.id}>
              {new Date(a.created_at).toLocaleString()} ·{" "}
              {a.verified_score === null
                ? "Ungraded"
                : Math.round(a.verified_score * 100) + "%"}
            </p>
          ))
        ) : (
          <p>No verified attempts yet.</p>
        )}
      </section>
    </>
  );
}
