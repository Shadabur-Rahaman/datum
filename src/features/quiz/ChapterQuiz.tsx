import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { useDraft } from "../persistence/useDraft";
import { DraftActions } from "../persistence/DraftActions";
import { useAuth } from "../auth/AuthProvider";
import { useJourney, type QuizAttempt } from "../journey/useJourney";
import { supabase } from "../../services/supabase";
import {
  chapterNames,
  chapterQuestions,
  publicPractice,
} from "./chapterQuestions";
import { gradePractice, type ChapterSession } from "./session";
export function ChapterQuiz() {
  const { user } = useAuth();
  const saved = useDraft<ChapterSession>("quiz-chapters-v22", {
    chapter: 0,
    mode: "practice",
    requestId: crypto.randomUUID(),
    cursor: 0,
    answers: {},
    startedAt: 0,
    timed: false,
    practiceHistory: [],
  });
  const s = saved.body;
  const journey = useJourney();
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!s.timed) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [s.timed]);
  useEffect(() => {
    setResult(
      journey.quizzes.find((a) => a.request_id === s.requestId) ?? null,
    );
  }, [s.requestId, journey.quizzes]);
  const qs =
    s.mode === "practice"
      ? [publicPractice[s.chapter]]
      : chapterQuestions.filter((q) => q.chapter === s.chapter);
  const q = qs[Math.min(s.cursor, qs.length - 1)];
  const practiceResult = s.practiceHistory.find((a) => a.id === s.requestId);
  const complete = !!result || !!practiceResult;
  const locked = saved.blocked || busy || complete;
  function restart(chapter = s.chapter, mode = s.mode) {
    saved.update({
      chapter,
      mode,
      requestId: crypto.randomUUID(),
      answers: {},
      cursor: 0,
      startedAt: Date.now(),
    });
    setResult(null);
    setError("");
  }
  function answer(value: string | string[] | number) {
    saved.update({
      answers: { ...s.answers, [q.id]: value },
      startedAt: s.startedAt || Date.now(),
    });
  }
  async function submit() {
    setBusy(true);
    setError("");
    try {
      if (s.mode === "practice") {
        const value = s.answers[q.id];
        if (typeof value !== "number")
          throw new Error("Enter a numeric answer.");
        saved.update({
          practiceHistory: [
            {
              id: s.requestId,
              at: new Date().toISOString(),
              chapter: s.chapter,
              correct: gradePractice(value, publicPractice[s.chapter].answer),
              answer: value,
            },
            ...s.practiceHistory.filter((a) => a.id !== s.requestId),
          ].slice(0, 30),
        });
      } else {
        if (!supabase || !user)
          throw new Error(
            "Verified assessment requires a configured cloud account. Practice is available without an account.",
          );
        if (!(await saved.save()))
          throw new Error(
            "Answers could not be synchronized. Retry saving first.",
          );
        const { data, error } = await supabase.rpc("grade_chapter_quiz", {
          p_content_id: `chapter-${s.chapter + 1}-v22`,
          p_owner: user.id,
          p_request_id: s.requestId,
          p_answers: s.answers,
        });
        if (error) throw error;
        setResult(Array.isArray(data) ? data[0] : data);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Grading failed. Your answers are retained; retry later.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel lesson-body" aria-label="Chapter quiz">
      <h2>Chapter challenges</h2>
      <p>
        36 assessment questions across six chapters. Separate public practice
        gives immediate, unverified feedback.
      </p>
      <div className="action-row">
        <label>
          Chapter
          <select
            disabled={busy || saved.blocked}
            value={s.chapter}
            onChange={(e) => restart(Number(e.target.value))}
          >
            {chapterNames.map((name, i) => (
              <option value={i} key={name}>
                {i + 1}. {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quiz mode
          <select
            disabled={busy || saved.blocked}
            value={s.mode}
            onChange={(e) =>
              restart(s.chapter, e.target.value as ChapterSession["mode"])
            }
          >
            <option value="practice">Guest practice · unverified</option>
            <option value="assessment">
              Verified assessment · account required
            </option>
          </select>
        </label>
      </div>
      <label>
        <input
          type="checkbox"
          checked={s.timed}
          onChange={(e) =>
            saved.update({
              timed: e.target.checked,
              startedAt: s.startedAt || Date.now(),
            })
          }
        />
        Show elapsed timer (no time limit)
      </label>
      {s.timed && (
        <p>
          Elapsed:{" "}
          {Math.max(0, Math.floor((now - (s.startedAt || now)) / 1000))}{" "}
          seconds. Leaving the page does not pause the timer.
        </p>
      )}
      <p>
        Question {Math.min(s.cursor, qs.length - 1) + 1} / {qs.length} ·{" "}
        {q.skill} · {q.difficulty}
      </p>
      <h3>{q.prompt}</h3>
      <fieldset disabled={locked}>
        <legend>
          {q.kind === "multi" ? "Select all that apply" : "Your answer"}
        </legend>
        {q.kind === "numeric" ? (
          <input
            aria-label="Chapter numeric answer"
            type="number"
            step="any"
            value={(s.answers[q.id] as number) ?? ""}
            onChange={(e) => {
              if (e.target.value === "") {
                const answers = { ...s.answers };
                delete answers[q.id];
                saved.update({ answers });
              } else if (Number.isFinite(Number(e.target.value)))
                answer(Number(e.target.value));
            }}
          />
        ) : (
          q.options.map((o) => (
            <label className="quiz-option" key={o.id}>
              <input
                type={q.kind === "multi" ? "checkbox" : "radio"}
                name={q.id}
                checked={
                  Array.isArray(s.answers[q.id])
                    ? (s.answers[q.id] as string[]).includes(o.id)
                    : s.answers[q.id] === o.id
                }
                onChange={() => {
                  if (q.kind !== "multi") answer(o.id);
                  else {
                    const old = Array.isArray(s.answers[q.id])
                      ? (s.answers[q.id] as string[])
                      : [];
                    answer(
                      old.includes(o.id)
                        ? old.filter((v) => v !== o.id)
                        : [...old, o.id],
                    );
                  }
                }}
              />
              {o.label}
            </label>
          ))
        )}
      </fieldset>
      <div className="action-row">
        <Button
          disabled={s.cursor === 0 || saved.blocked}
          onClick={() => saved.update({ cursor: s.cursor - 1 })}
        >
          Previous chapter question
        </Button>
        <Button
          disabled={s.cursor >= qs.length - 1 || saved.blocked}
          onClick={() => saved.update({ cursor: s.cursor + 1 })}
        >
          Next chapter question
        </Button>
        <Button
          disabled={
            locked ||
            qs.some(
              (x) =>
                s.answers[x.id] === undefined ||
                (Array.isArray(s.answers[x.id]) &&
                  !(s.answers[x.id] as string[]).length),
            ) ||
            (s.mode === "assessment" && (!user || !supabase))
          }
          onClick={() => void submit()}
        >
          {busy
            ? "Checking…"
            : s.mode === "practice"
              ? "Check practice answer"
              : "Submit chapter assessment"}
        </Button>
      </div>
      {s.mode === "assessment" && !user && (
        <p>
          Sign in to submit for trusted grading. Your answer draft can still be
          saved on this device.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {practiceResult && (
        <p role="status">
          {practiceResult.correct ? "Correct" : "Review"} · Local practice, not
          verified. {publicPractice[s.chapter].explanation}
        </p>
      )}
      {result && (
        <div>
          <h3>
            Verified chapter score:{" "}
            {Math.round((result.verified_score ?? 0) * 100)}%
          </h3>
          {(result.feedback ?? []).map((f) => (
            <p key={f.id}>
              <strong>
                {f.correct ? "Correct" : "Review"}:{" "}
                {chapterQuestions.find((q) => q.id === f.id)?.prompt}
              </strong>
              <br />
              {f.explanation}
            </p>
          ))}
          {(result.feedback ?? []).some((f) => !f.correct) && (
            <Button
              onClick={() => {
                const first = qs.findIndex((q) =>
                  (result.feedback ?? []).some(
                    (f) => f.id === q.id && !f.correct,
                  ),
                );
                const answers = { ...s.answers };
                (result.feedback ?? [])
                  .filter((f) => !f.correct)
                  .forEach((f) => delete answers[f.id]);
                saved.update({
                  requestId: crypto.randomUUID(),
                  answers,
                  cursor: Math.max(0, first),
                  startedAt: Date.now(),
                });
                setResult(null);
              }}
            >
              Retry mistakes (keep correct answers)
            </Button>
          )}
        </div>
      )}
      {complete && (
        <Button onClick={() => restart()}>Start another chapter attempt</Button>
      )}
      <DraftActions draft={saved} saveLabel="Save chapter quiz" />
      <details>
        <summary>Practice history and topic performance</summary>
        <p>Last 30 device/account practice records; unverified.</p>
        {chapterNames.map((name, i) => {
          const attempts = s.practiceHistory.filter((a) => a.chapter === i);
          return (
            <p key={name}>
              {name}: {attempts.filter((a) => a.correct).length}/
              {attempts.length} correct
            </p>
          );
        })}
        {s.practiceHistory.map((a) => (
          <p key={a.id}>
            {new Date(a.at).toLocaleString()} · {chapterNames[a.chapter]} ·{" "}
            {a.correct ? "Correct" : "Needs review"}
          </p>
        ))}
      </details>
    </section>
  );
}
