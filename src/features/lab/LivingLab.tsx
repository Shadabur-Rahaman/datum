import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, PageHeading } from "../../components/ui/shared";
import { Button } from "../../components/ui/button";
import { useDraft } from "../persistence/useDraft";
import { DraftActions } from "../persistence/DraftActions";
import { persistDraft, loadDraft } from "../persistence/repository";
import { useAuth } from "../auth/AuthProvider";
import { notebookSchema, type Evidence } from "../journey/schema";
import {
  original,
  DATASET,
  initialLab,
  defaultConfig,
  transform,
  stats,
  runExperiment,
  nextStage,
  csv,
  type Config,
  type LabState,
  type Delivery,
} from "./engine";
const PythonPanel = lazy(() => import("../python/PythonPanel"));
const Mentor = lazy(() => import("../mentor/Mentor"));
const fmt = (n: number | null) =>
  n === null ? "No observations" : n.toFixed(1);
export function LivingLab() {
  const saved = useDraft<LabState>("lab-delivery", initialLab),
    s = saved.body;
  const { user } = useAuth();
  const [panel, setPanel] = useState("Data"),
    [mobile, setMobile] = useState("Workspace"),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState<"id" | "duration" | "distance">("id"),
    [page, setPage] = useState(0),
    [message, setMessage] = useState(""),
    [capturing, setCapturing] = useState(false);
  const active = s.executed ? s.config : defaultConfig;
  const rows = useMemo(() => transform(original, active), [active]);
  const summary = stats(rows);
  const result =
    s.executed && s.prediction ? runExperiment(s.config, s.prediction) : null;
  const visible = rows
    .filter((r) =>
      Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "id"
        ? a.id.localeCompare(b.id)
        : (a[sort] ?? Infinity) - (b[sort] ?? Infinity),
    );
  function configure(patch: Partial<Config>) {
    saved.update({
      config: { ...s.config, ...patch },
      executed: false,
      stage: "EXPERIMENT",
      prediction: "",
    });
    setMessage("Choose a prediction, then run to reveal the changed result.");
    setPage(0);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([csv(rows)], { type: "text/csv" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "datum-delivery-synthetic-v1.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function capture() {
    setCapturing(true);
    setMessage("");
    try {
      if (
        s.hypothesis.trim().length < 20 ||
        !s.executed ||
        s.explanation.trim().length < 30 ||
        s.limitations.trim().length < 20
      )
        throw new Error(
          "Write a hypothesis (20+ characters), run an experiment and write a finding (30+ characters) and limitation (20+ characters).",
        );
      const old = await loadDraft(user?.id ?? null, "evidence-notebook");
      const book = old ? notebookSchema.parse(old.body) : { entries: [] };
      const entry: Evidence = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        dataset: DATASET.id as "delivery-synthetic",
        version: 1,
        seed: 20261103,
        config: s.config,
        prediction: s.prediction,
        hypothesis: s.hypothesis,
        code: s.code,
        finding: s.explanation,
        limitations: s.limitations,
        reflection: s.reflection,
      };
      if (book.entries.length >= 30)
        throw new Error(
          "Notebook is full. Export and remove an entry before saving another.",
        );
      await persistDraft(
        user?.id ?? null,
        "evidence-notebook",
        { entries: [entry, ...book.entries] },
        old?.revision ?? 0,
      );
      setMessage(
        "Evidence saved with reproducible dataset and transformation references.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Could not save evidence. Your work remains in the workspace.",
      );
    } finally {
      setCapturing(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="INVESTIGATE / SYNTHETIC CASE 001"
        title="The Delivery Delay Mystery"
        description="Predict a change. Test it against 1,000 reproducible records. Explain what the evidence can—and cannot—say."
      >
        <Badge tone="teal">LIVING DATA · V1</Badge>
      </PageHeading>
      <p className="preview-note">
        Synthetic educational data · seed {DATASET.seed} · {DATASET.limitations}{" "}
        <Link className="text-link" to="/investigate/legacy">
          Open earlier saved workspace
        </Link>
      </p>
      <div
        className="stage-strip"
        role="region"
        aria-label="Investigation progress"
        tabIndex={0}
      >
        {[
          "BRIEF",
          "HYPOTHESIS",
          "EXPLORE",
          "EXPERIMENT",
          "EXPLAIN",
          "REFLECT",
          "COMPLETE",
        ].map((stage) => (
          <span key={stage} className={s.stage === stage ? "current" : ""}>
            {stage}
          </span>
        ))}
      </div>
      <div className="mobile-tabs">
        {["Brief", "Workspace", "Mentor"].map((p) => (
          <Button
            key={p}
            variant={mobile === p ? "default" : "outline"}
            onClick={() => setMobile(p)}
            aria-pressed={mobile === p}
          >
            {p}
          </Button>
        ))}
      </div>
      <div className="workspace">
        <aside
          className={`panel brief-pane ${mobile === "Brief" ? "mobile-active" : ""}`}
        >
          <h2>Is rain the whole story?</h2>
          <p className="muted">
            Complaints rise with long waits. Compare weather, distance,
            preparation and rush hour before concluding why.
          </p>
          <label htmlFor="lab-hypothesis">Your hypothesis</label>
          <textarea
            id="lab-hypothesis"
            maxLength={1500}
            value={s.hypothesis}
            disabled={saved.blocked}
            onChange={(e) => saved.update({ hypothesis: e.target.value })}
          />
          <h3>Evidence requirements</h3>
          <ol className="checklist">
            <li>Hypothesis: 20+ characters</li>
            <li>Predict and run an experiment</li>
            <li>Finding: 30+ characters</li>
            <li>Limitation and reflection: 20+ characters each</li>
          </ol>
          <Button
            variant="outline"
            disabled={saved.blocked || s.stage === "COMPLETE"}
            onClick={() => {
              try {
                saved.update({ stage: nextStage(s) });
                setMessage("");
              } catch (e) {
                setMessage((e as Error).message);
              }
            }}
          >
            Advance investigation step
          </Button>
          <p className="small muted">
            Completion is a self-directed investigation record, not verified
            mastery.
          </p>
        </aside>
        <section
          className={`panel data-pane ${mobile === "Workspace" ? "mobile-active" : ""}`}
        >
          <div className="workspace-tabs">
            {["Data", "Chart", "Experiment", "Python", "Explain"].map((p) => (
              <button
                key={p}
                className={panel === p ? "active" : ""}
                aria-pressed={panel === p}
                onClick={() => setPanel(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="workspace-content">
            <div className="metrics">
              <span>
                Records <b>{summary.rows}</b>
              </span>
              <span>
                Mean minutes <b>{fmt(summary.mean)}</b>
              </span>
              <span>
                Median minutes <b>{fmt(summary.median)}</b>
              </span>
              <span>
                Missing <b>{summary.missing}</b>
              </span>
            </div>
            {panel === "Data" ? (
              <>
                <p className="small muted">
                  Summary, chart, Python rows and CSV share the executed
                  analysis. Search below only changes visible rows.
                </p>
                <div className="action-row">
                  <input
                    aria-label="Search visible records"
                    placeholder="Search visible rows…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                  />
                  <label>
                    Sort records
                    <select
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value as typeof sort);
                        setPage(0);
                      }}
                    >
                      <option value="id">Order ID</option>
                      <option value="duration">Duration</option>
                      <option value="distance">Distance</option>
                    </select>
                  </label>
                  <Button variant="outline" onClick={download}>
                    Download analysis CSV
                  </Button>
                </div>
                <div
                  className="table-scroll"
                  role="region"
                  aria-label="Delivery records"
                  tabIndex={0}
                >
                  <table>
                    <caption>
                      {visible.length} visible of {rows.length} analyzed records
                    </caption>
                    <thead>
                      <tr>
                        {[
                          "Order ID",
                          "Distance (km)",
                          "Weather",
                          "Rush hour",
                          "Preparation (min)",
                          "Duration (min)",
                          "Originally missing",
                          "Complaint",
                        ].map((c) => (
                          <th key={c} scope="col">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visible.slice(page * 20, page * 20 + 20).map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.distance}</td>
                          <td>{r.weather}</td>
                          <td>{r.rush ? "Yes" : "No"}</td>
                          <td>{r.preparation}</td>
                          <td>{r.duration ?? "Missing"}</td>
                          <td>{r.missing ? "Yes" : "No"}</td>
                          <td>{r.complaint ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="action-row">
                  <Button
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous rows
                  </Button>
                  <span>
                    Page {page + 1} /{" "}
                    {Math.max(1, Math.ceil(visible.length / 20))}
                  </span>
                  <Button
                    variant="outline"
                    disabled={(page + 1) * 20 >= visible.length}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next rows
                  </Button>
                </div>
                <details>
                  <summary>Column definitions and generation method</summary>
                  <p className="small muted">
                    {DATASET.method} Distance/preparation/duration are numeric;
                    weather categorical; rush, missingness and complaints
                    boolean. Originally missing records retain their provenance
                    after imputation.
                  </p>
                </details>
              </>
            ) : null}
            {panel === "Chart" ? <GroupChart rows={rows} /> : null}
            {panel === "Experiment" ? (
              <>
                <h2>Prediction before execution</h2>
                <p className="muted">
                  Choose an analysis. Predict how mean delivery time will change
                  relative to the original dataset. Edits hide the new result
                  until you run.
                </p>
                <div className="experiment-controls">
                  <label>
                    Weather
                    <select
                      value={s.config.weather}
                      onChange={(e) =>
                        configure({
                          weather: e.target.value as Config["weather"],
                        })
                      }
                    >
                      {["All", "Clear", "Rain", "Cloudy"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Rush hour
                    <select
                      value={s.config.rush}
                      onChange={(e) =>
                        configure({ rush: e.target.value as Config["rush"] })
                      }
                    >
                      {["All", "Yes", "No"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Missing durations
                    <select
                      value={s.config.missing}
                      onChange={(e) =>
                        configure({
                          missing: e.target.value as Config["missing"],
                        })
                      }
                    >
                      <option value="keep">Keep missing</option>
                      <option value="drop">Drop missing rows</option>
                      <option value="median">
                        Impute selected-data median
                      </option>
                    </select>
                  </label>
                  <label>
                    Maximum distance: {s.config.maxDistance} km
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step=".5"
                      value={s.config.maxDistance}
                      onChange={(e) =>
                        configure({ maxDistance: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Exclude durations above: {s.config.outlierCap} min
                    <input
                      type="range"
                      min="30"
                      max="240"
                      step="5"
                      value={s.config.outlierCap}
                      onChange={(e) =>
                        configure({ outlierCap: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Sample size: {s.config.sampleSize}
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={s.config.sampleSize}
                      onChange={(e) =>
                        configure({ sampleSize: Number(e.target.value) })
                      }
                    />
                  </label>
                </div>
                <label>
                  My prediction
                  <select
                    aria-label="Prediction"
                    value={s.prediction}
                    onChange={(e) =>
                      saved.update({
                        prediction: e.target.value as LabState["prediction"],
                        executed: false,
                      })
                    }
                  >
                    <option value="">Choose a direction</option>
                    <option value="increase">Mean increases</option>
                    <option value="decrease">Mean decreases</option>
                    <option value="same">
                      Mean stays approximately the same
                    </option>
                  </select>
                </label>
                <div className="action-row">
                  <Button
                    disabled={
                      saved.blocked ||
                      !s.prediction ||
                      s.hypothesis.trim().length < 20
                    }
                    onClick={() => {
                      saved.update({ executed: true, stage: "EXPLAIN" });
                      setPage(0);
                    }}
                  >
                    Run experiment
                  </Button>
                  <Button
                    variant="outline"
                    disabled={saved.blocked}
                    onClick={() => {
                      saved.update({
                        config: defaultConfig,
                        prediction: "",
                        executed: false,
                        stage: "EXPERIMENT",
                      });
                      setPage(0);
                    }}
                  >
                    Reset experiment
                  </Button>
                </div>
                {result && (
                  <div className="insight" role="status">
                    <p>
                      Original mean: {fmt(result.before.mean)} min. Modified
                      mean: {fmt(result.after.mean)} min. Difference:{" "}
                      {fmt(result.difference)} min.
                      <br />
                      {result.direction === null
                        ? "No observed durations remain; the prediction cannot be assessed."
                        : result.predictionCorrect
                          ? "Your prediction matched the direction. Now explain why."
                          : "The result differed from your prediction. Revisit which records changed."}
                      <br />
                      Prediction accuracy alone is not conceptual mastery.
                    </p>
                  </div>
                )}
              </>
            ) : null}
            {panel === "Python" ? (
              <Suspense fallback={<p>Loading Python workspace…</p>}>
                <PythonPanel
                  starter={initialLab.code}
                  code={s.code}
                  onChange={(code) => saved.update({ code })}
                  rows={rows}
                />
              </Suspense>
            ) : null}
            {panel === "Explain" ? (
              <>
                <label>
                  Finding tied to the measurements
                  <textarea
                    aria-label="Finding"
                    maxLength={2000}
                    value={s.explanation}
                    onChange={(e) =>
                      saved.update({ explanation: e.target.value })
                    }
                  />
                </label>
                <label>
                  Limitations
                  <textarea
                    aria-label="Limitations"
                    maxLength={1500}
                    value={s.limitations}
                    onChange={(e) =>
                      saved.update({ limitations: e.target.value })
                    }
                  />
                </label>
                <label>
                  Reflection: what changed your thinking?
                  <textarea
                    aria-label="Reflection"
                    maxLength={2000}
                    value={s.reflection}
                    onChange={(e) =>
                      saved.update({ reflection: e.target.value })
                    }
                  />
                </label>
                <Button
                  disabled={capturing || saved.blocked}
                  onClick={() => void capture()}
                >
                  {capturing ? "Saving evidence…" : "Save finding to notebook"}
                </Button>
              </>
            ) : null}
          </div>
        </section>
        <aside
          className={`panel mentor-pane ${mobile === "Mentor" ? "mobile-active" : ""}`}
        >
          <Suspense fallback={<p>Loading mentor…</p>}>
            <Mentor
              context={{
                hypothesis: s.hypothesis,
                summary,
                explanation: s.explanation,
                limitations: s.limitations,
              }}
            />
          </Suspense>
        </aside>
      </div>
      <p role="status">{message}</p>
      <DraftActions draft={saved} />
    </>
  );
}
export function GroupChart({ rows }: { rows: Delivery[] }) {
  return (
    <>
      <h2>Compare weather groups</h2>
      <p className="small muted">
        Mean duration in minutes; missing durations excluded. Counts and exact
        values are shown. Groups may differ in distance and rush hour.
      </p>
      <div className="sample-chart">
        {(["Clear", "Cloudy", "Rain"] as const).map((weather) => {
          const m = stats(rows.filter((r) => r.weather === weather));
          return (
            <div key={weather}>
              <span>{weather}</span>
              <div>
                <i
                  style={{
                    width: `${Math.min(100, ((m.mean ?? 0) / 180) * 100)}%`,
                  }}
                />
              </div>
              <b>
                {fmt(m.mean)} min (n={m.observed})
              </b>
            </div>
          );
        })}
      </div>
      <p className="small muted">
        Axis 0–180 minutes. Numerical labels remain the authoritative values.
      </p>
    </>
  );
}
