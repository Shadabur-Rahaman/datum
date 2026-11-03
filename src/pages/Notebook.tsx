import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeading } from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { useDraft } from "../features/persistence/useDraft";
import { DraftActions } from "../features/persistence/DraftActions";
import { type Evidence } from "../features/journey/schema";
import { useAuth } from "../features/auth/AuthProvider";
import { loadDraft, persistDraft } from "../features/persistence/repository";
import { initialLab, labSchema } from "../features/lab/engine";
export function Notebook() {
  const saved = useDraft("evidence-notebook", { entries: [] as Evidence[] }),
    { user } = useAuth(),
    navigate = useNavigate(),
    [message, setMessage] = useState("");
  function exportMarkdown() {
    const text = saved.body.entries
      .map(
        (e) =>
          `# Delivery investigation\n\n${e.createdAt}\n\nDataset: ${e.dataset} v${e.version}, seed ${e.seed}\n\n## Hypothesis\n${e.hypothesis}\n\n## Experiment\n\`\`\`json\n${JSON.stringify(e.config, null, 2)}\n\`\`\`\n\n## Code\n\`\`\`python\n${e.code}\n\`\`\`\n\n## Finding\n${e.finding}\n\n## Limitations\n${e.limitations}\n\n## Reflection\n${e.reflection}`,
      )
      .join("\n\n---\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/markdown" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "datum-evidence.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function reopen(e: Evidence) {
    try {
      const old = await loadDraft(user?.id ?? null, "lab-delivery");
      if (
        old &&
        !window.confirm(
          "Replace the saved investigation with this notebook experiment? The notebook entry will be retained.",
        )
      )
        return;
      await persistDraft(
        user?.id ?? null,
        "lab-delivery",
        labSchema.parse({
          ...initialLab,
          config: e.config,
          prediction: e.prediction,
          code: e.code,
          hypothesis: e.hypothesis,
          explanation: e.finding,
          limitations: e.limitations,
          reflection: e.reflection,
          executed: true,
          stage: "EXPLAIN",
        }),
        old?.revision ?? 0,
      );
      navigate("/investigate");
    } catch {
      setMessage(
        "Could not reopen this experiment. Retry after checking your connection.",
      );
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="EVIDENCE / YOUR RESEARCH TRAIL"
        title="Evidence Notebook"
        description="Every finding keeps its dataset, transformation and limitations."
      />
      <Button
        variant="outline"
        disabled={!saved.body.entries.length}
        onClick={exportMarkdown}
      >
        Export Markdown
      </Button>
      {!saved.body.entries.length && (
        <section className="panel empty-state">
          <h2>No findings yet</h2>
          <p>
            Run an experiment in Investigate, explain the result, then save it
            here.
          </p>
        </section>
      )}
      {saved.body.entries.map((e) => (
        <article className="panel lesson-body" key={e.id}>
          <h2>{e.hypothesis || "Delivery investigation"}</h2>
          <p className="small muted">
            {new Date(e.createdAt).toLocaleString()} · {e.dataset} v{e.version}{" "}
            · seed {e.seed}
          </p>
          <label>
            Finding
            <textarea
              aria-label="Finding"
              value={e.finding}
              minLength={30}
              maxLength={2000}
              disabled={saved.blocked}
              onChange={(event) =>
                saved.update({
                  entries: saved.body.entries.map((x) =>
                    x.id === e.id ? { ...x, finding: event.target.value } : x,
                  ),
                })
              }
            />
          </label>
          <label>
            Limitations
            <textarea
              aria-label="Limitations"
              value={e.limitations}
              minLength={20}
              maxLength={1500}
              disabled={saved.blocked}
              onChange={(event) =>
                saved.update({
                  entries: saved.body.entries.map((x) =>
                    x.id === e.id
                      ? { ...x, limitations: event.target.value }
                      : x,
                  ),
                })
              }
            />
          </label>
          <label>
            Reflection
            <textarea
              aria-label="Reflection"
              value={e.reflection}
              maxLength={2000}
              disabled={saved.blocked}
              onChange={(event) =>
                saved.update({
                  entries: saved.body.entries.map((x) =>
                    x.id === e.id
                      ? { ...x, reflection: event.target.value }
                      : x,
                  ),
                })
              }
            />
          </label>
          <details>
            <summary>Reproducible experiment and code</summary>
            <pre>{JSON.stringify(e.config, null, 2)}</pre>
            <pre>{e.code}</pre>
          </details>
          <div className="action-row">
            <Button disabled={saved.blocked} onClick={() => void reopen(e)}>
              Reopen experiment
            </Button>
            <Button
              variant="outline"
              disabled={saved.blocked}
              onClick={() => {
                if (
                  window.confirm(
                    "Remove this finding from the notebook? Save the notebook to confirm removal.",
                  )
                )
                  saved.update({
                    entries: saved.body.entries.filter((x) => x.id !== e.id),
                  });
              }}
            >
              Remove entry
            </Button>
          </div>
        </article>
      ))}
      <p role="status">{message}</p>
      <DraftActions draft={saved} />
    </>
  );
}
