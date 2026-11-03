import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import {
  activities,
  computeActivity,
  direction,
  evaluateActivity,
} from "./activities";
import type { ActivityState } from "./schema";
import { useDraft } from "../persistence/useDraft";
import { DraftActions } from "../persistence/DraftActions";
import { Button } from "../../components/ui/button";
const Mentor = lazy(() => import("../mentor/Mentor"));
export function InteractiveLesson({ id }: { id: string }) {
  const a = activities[id],
    saved = useDraft<ActivityState>("lesson-activity-" + id, {
      parameter: a.initial,
      prediction: "",
      ran: false,
      answer: "",
      applied: "",
      explanation: "",
      hints: 0,
      attempts: [],
    }),
    s = saved.body,
    [feedback, setFeedback] = useState(""),
    [hint, setHint] = useState(false);
  const result = computeActivity(id, s.parameter),
    baseline = computeActivity(id, a.initial),
    scale = Math.max(1, ...result.values);
  return (
    <section className="interactive-lesson" aria-label="Lesson activity">
      <h2>Understand: {a.objective}</h2>
      <p>{a.analogy}</p>
      <h3>Worked example</h3>
      <p>{a.example}</p>
      <h3>Predict and experiment</h3>
      <label>
        {a.parameterLabel}: {s.parameter}
        <input
          aria-label="Activity parameter"
          type="range"
          min={a.min}
          max={a.max}
          step="1"
          value={s.parameter}
          disabled={saved.blocked}
          onChange={(e) =>
            saved.update({
              parameter: Number(e.target.value),
              ran: false,
              prediction: "",
              applied: "",
            })
          }
        />
      </label>
      <p className="small muted">
        Compare your selected setting with the starting setting {a.initial}.
        Predict whether the reported {a.unit} will increase, decrease or stay
        the same.
      </p>
      <label>
        Prediction
        <select
          aria-label="Activity prediction"
          value={s.prediction}
          disabled={saved.blocked}
          onChange={(e) =>
            saved.update({
              prediction: e.target.value as ActivityState["prediction"],
              ran: false,
            })
          }
        >
          <option value="">Choose a direction</option>
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
          <option value="same">Stay the same</option>
        </select>
      </label>
      <Button
        disabled={!s.prediction || saved.blocked}
        onClick={() => saved.update({ ran: true })}
      >
        Run lesson experiment
      </Button>
      {s.ran && (
        <div className="panel lesson-body">
          <p role="status">
            Computed result:{" "}
            <strong>
              {result.metric.toFixed(2)} {a.unit}
            </strong>
            .{" "}
            {direction(baseline.metric, result.metric) === s.prediction
              ? "Prediction matched."
              : "Prediction differed; inspect what changed."}
          </p>
          <p>{result.explanation}</p>
          <div
            className="skill-bars"
            aria-label="Calculated demonstration values"
          >
            {result.values.map((v, i) => (
              <div className="skill-row" key={i}>
                <span>{result.labels[i]}</span>
                <div className="progress" aria-hidden="true">
                  <span style={{ width: (100 * v) / scale + "%" }} />
                </div>
                <span>{v.toFixed(2)}</span>
              </div>
            ))}
          </div>
          {!result.values.length && <p>No records satisfy this rule.</p>}
        </div>
      )}
      <h3>Practice and verify</h3>
      <p>{a.check}</p>
      <div className="action-row">
        {[a.incorrect, a.correct].map((value) => (
          <Button
            key={value}
            variant="outline"
            aria-pressed={s.answer === value}
            disabled={saved.blocked}
            onClick={() => saved.update({ answer: value })}
          >
            {value}
          </Button>
        ))}
      </div>
      {s.answer && (
        <p role="status">
          {s.answer === a.correct ? "Correct." : "Reconsider."} {a.feedback}
        </p>
      )}
      <label>
        Applied check: enter the computed result (round to two decimals)
        <input
          type="number"
          step="any"
          aria-label="Applied result"
          value={s.applied}
          disabled={saved.blocked || !s.ran}
          onChange={(e) => saved.update({ applied: e.target.value })}
        />
      </label>
      <Button
        variant="ghost"
        onClick={() => {
          setHint(!hint);
          if (!hint) saved.update({ hints: Math.min(1000, s.hints + 1) });
        }}
      >
        Show activity hint
      </Button>
      {hint && (
        <p>
          {a.feedback} Use the worked example to check each step, then compare
          it with the computed result.
        </p>
      )}
      <h3>Reflect</h3>
      <label>
        Explain the result and one limitation
        <textarea
          aria-label="Activity explanation"
          value={s.explanation}
          maxLength={2000}
          disabled={saved.blocked}
          onChange={(e) => saved.update({ explanation: e.target.value })}
        />
      </label>
      <div className="action-row">
        <Button
          disabled={saved.blocked}
          onClick={() => {
            const evaluation = evaluateActivity(id, s);
            saved.update({
              attempts: [
                ...s.attempts,
                {
                  at: new Date().toISOString(),
                  parameter: s.parameter,
                  ...evaluation,
                },
              ].slice(-30),
            });
            setFeedback(
              evaluation.passed
                ? "Activity checks passed. Practice evidence recorded; this is not a server-verified assessment."
                : "Keep investigating: run with a prediction, answer the knowledge check, enter the calculated result and write a 20-character explanation.",
            );
          }}
        >
          Check and record activity
        </Button>
        <Link className="text-link" to={"/practice?challenge=" + a.challenge}>
          Execute a related Python challenge
        </Link>
      </div>
      <p role="status">{feedback}</p>
      <p className="small muted">
        {s.attempts.filter((x) => x.passed).length} successful practice checks ·{" "}
        {s.hints} hints used. Reading this page never completes a lesson.
      </p>
      <details>
        <summary>Ask about this lesson</summary>
        <Suspense fallback={<p>Loading tutor…</p>}>
          <Mentor
            context={{
              lesson: id,
              objective: a.objective,
              example: a.example,
              parameter: s.parameter,
              result: s.ran ? result : null,
              prediction: s.prediction,
              answer: s.answer,
              reflection: s.explanation.slice(0, 500),
            }}
          />
        </Suspense>
      </details>
      <DraftActions draft={saved} saveLabel="Save activity" />
    </section>
  );
}
