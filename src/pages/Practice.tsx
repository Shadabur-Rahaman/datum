import { lazy, Suspense, useState } from "react";
import { PageHeading, Badge } from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { challenges } from "../features/python/challenges";
import { useDraft } from "../features/persistence/useDraft";
import { DraftActions } from "../features/persistence/DraftActions";
import { practiceSchema } from "../features/journey/schema";
import type { z } from "zod";
const PythonPanel = lazy(() => import("../features/python/PythonPanel"));
export function Practice() {
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      challenges.findIndex(
        (c) =>
          c.id ===
          new URLSearchParams(
            window.location.hash.split("?")[1] ?? window.location.search,
          ).get("challenge"),
      ),
    ),
  );
  return (
    <>
      <PageHeading
        eyebrow="PRACTICE / DATA DETECTIVE"
        title="Practice"
        description="Six challenges. Real execution. Small, inspectable checks."
      />
      <div className="action-row">
        {challenges.map((c, i) => (
          <Button
            variant={i === index ? "default" : "outline"}
            key={c.id}
            onClick={() => setIndex(i)}
          >
            {i + 1}. {c.title}
          </Button>
        ))}
      </div>
      <Challenge key={challenges[index].id} index={index} />
    </>
  );
}
function Challenge({ index }: { index: number }) {
  const c = challenges[index],
    saved = useDraft<z.infer<typeof practiceSchema>>("practice-" + c.id, {
      code: c.starter,
      attempts: [],
    });
  return (
    <section className="panel lesson-body">
      <Badge>{c.skill}</Badge>
      <h2>{c.title}</h2>
      <p>{c.objective}</p>
      <p className="small muted">
        Implement solve(input). Each run checks two cases, including an edge
        case. Save your draft to keep code and practice history.
      </p>
      {!saved.blocked && (
        <Suspense fallback={<p>Loading workspace…</p>}>
          <PythonPanel
            code={saved.body.code}
            onChange={(code) => saved.update({ code })}
            starter={c.starter}
            tests={c.tests}
            onResult={(r) =>
              saved.update({
                attempts: [
                  ...saved.body.attempts,
                  {
                    at: new Date().toISOString(),
                    passed:
                      r.length === c.tests.length && r.every((x) => x.passed),
                    checks: r.filter((x) => x.passed).length,
                  },
                ].slice(-30),
              })
            }
          />
        </Suspense>
      )}
      <details>
        <summary>Show a hint</summary>
        <p>{c.hint}</p>
      </details>
      <p>
        {saved.body.attempts.length} saved or pending practice runs ·{" "}
        {saved.body.attempts.filter((a) => a.passed).length} passed all checks.
        Unverified browser evidence.
      </p>
      <DraftActions draft={saved} />
    </section>
  );
}
