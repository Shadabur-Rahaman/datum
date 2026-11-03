import { useState } from "react";
import {
  Database,
  FileCode2,
  ChartNoAxesCombined,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Download,
} from "lucide-react";
import { demoRows, missionStages } from "../content/track";
import { Badge, PageHeading } from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { useDraft } from "../features/persistence/useDraft";
import { DraftActions } from "../features/persistence/DraftActions";
import type { MissionBody } from "../features/persistence/schema";
const starter =
  '# Python execution arrives in Phase 4\n# Preview the analysis you will build\nimport pandas as pd\n\n# Compare durations, then consider confounders\n# df.groupby("weather")["minutes"].mean()';
export function Investigate() {
  const saved = useDraft<MissionBody>("delivery-delay", {
    hypothesis: "",
    code: starter,
    query: "",
    panel: "Data",
  });
  const { panel, hypothesis, code, query } = saved.body;
  const [mobile, setMobile] = useState("Workspace");
  const [guide, setGuide] = useState(false);
  const rows = demoRows.filter((r) =>
    Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  function download() {
    const blob = new Blob(
      [
        "order_id,distance_km,weather,rush_hour,duration_min\n" +
          rows
            .map((r) =>
              [r.id, r.distance, r.weather, r.rush, r.minutes ?? ""].join(","),
            )
            .join("\n"),
      ],
      { type: "text/csv" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datum-layout-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <PageHeading
        eyebrow="INVESTIGATE / CASE FILE 001"
        title="The Delivery Delay Mystery"
        description="More complaints. Longer waits. Investigate what might be behind the delays."
      >
        <Badge tone="amber">WORKSPACE PREVIEW</Badge>
      </PageHeading>
      <div
        className="stage-strip"
        tabIndex={0}
        role="region"
        aria-label="Planned investigation stages"
      >
        {missionStages.map((s, i) => (
          <span className={i === 0 ? "current" : ""} key={s}>
            <b>0{i + 1}</b>
            {s}
            {i < 6 && <ArrowRight size={12} />}
          </span>
        ))}
      </div>
      <p className="preview-note">
        Six authored sample rows · Full living datasets arrive in Milestone 2.2.
        Save your hypothesis, code and selected view to resume. Saving does not
        complete a mission.
      </p>
      <div className="mobile-tabs" aria-label="Workspace panels">
        {["Brief", "Workspace", "Mentor"].map((s) => (
          <Button
            key={s}
            variant={mobile === s ? "default" : "outline"}
            aria-pressed={mobile === s}
            onClick={() => setMobile(s)}
          >
            {s}
          </Button>
        ))}
      </div>
      <div className="workspace">
        <aside
          className={`panel brief-pane ${mobile === "Brief" ? "mobile-active" : ""}`}
        >
          <p className="eyebrow">MISSION BRIEF</p>
          <h2>A pattern, or a coincidence?</h2>
          <p className="muted">
            The operations team suspects rain. Your job is to examine distance,
            rush-hour traffic and missing records before drawing a conclusion.
          </p>
          <h3>Your evidence checklist</h3>
          <ul className="checklist">
            {[
              "Inspect variables and data quality",
              "State a testable hypothesis",
              "Compare relevant groups",
              "Run an analysis and create a chart",
              "Explain a finding and a limitation",
            ].map((s, i) => (
              <li key={s}>
                <span>{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
          <label htmlFor="hypothesis">Your initial hypothesis</label>
          <textarea
            id="hypothesis"
            value={hypothesis}
            disabled={saved.blocked}
            onChange={(e) => saved.update({ hypothesis: e.target.value })}
            maxLength={1500}
            placeholder="Rainy deliveries may take longer because…"
          />
          <p className="small muted">
            Use Save draft below the workspace to keep your hypothesis.
          </p>
        </aside>
        <section
          className={`panel data-pane ${mobile === "Workspace" ? "mobile-active" : ""}`}
        >
          <div className="workspace-tabs" aria-label="Analysis views">
            {[
              { s: "Data", icon: Database },
              { s: "Chart", icon: ChartNoAxesCombined },
              { s: "Python", icon: FileCode2 },
            ].map(({ s, icon: Icon }) => (
              <button
                key={s}
                disabled={saved.blocked}
                onClick={() =>
                  saved.update({ panel: s as MissionBody["panel"] })
                }
                aria-pressed={panel === s}
                className={panel === s ? "active" : ""}
              >
                <Icon size={16} />
                {s}
              </button>
            ))}
          </div>
          <div className="workspace-content">
            {panel === "Data" ? (
              <>
                <div className="section-top">
                  <div>
                    <h3>delivery_sample.csv</h3>
                    <p className="small muted">
                      6 rows · 5 columns · illustrative fixture
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Download sample CSV"
                    onClick={download}
                  >
                    <Download size={17} />
                  </Button>
                </div>
                <input
                  className="data-search"
                  aria-label="Search sample rows"
                  placeholder="Search sample rows…"
                  value={query}
                  maxLength={200}
                  disabled={saved.blocked}
                  onChange={(e) => saved.update({ query: e.target.value })}
                />
                <div
                  className="table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Delivery sample table"
                >
                  <table>
                    <caption className="sr-only">
                      Six illustrative delivery records for the workspace
                      preview
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">
                          Order ID <small>text</small>
                        </th>
                        <th scope="col">
                          Distance <small>km · number</small>
                        </th>
                        <th scope="col">
                          Weather <small>category</small>
                        </th>
                        <th scope="col">
                          Rush hour <small>category</small>
                        </th>
                        <th scope="col">
                          Duration <small>min · number</small>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.distance}</td>
                          <td>
                            <span
                              className={`weather ${r.weather === "Rain" ? "rain" : ""}`}
                            >
                              {r.weather}
                            </span>
                          </td>
                          <td>{r.rush}</td>
                          <td>
                            {r.minutes ?? (
                              <span className="missing">Missing</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!rows.length && (
                  <p role="status">
                    No matching records. Clear your search to restore the
                    sample.
                  </p>
                )}
                <p className="small muted table-foot">
                  {rows.length} of 6 sample rows · Original authored fixture,
                  not a representative population.
                </p>
                <div className="insight">
                  <Database size={18} />
                  <p>
                    <strong>Every missing value is a question.</strong>
                    <br />
                    Why might one delivery have no recorded duration?
                  </p>
                </div>
              </>
            ) : panel === "Chart" ? (
              <div>
                <h3>Duration by sample delivery</h3>
                <p className="muted small">
                  {rows.length} filtered records · same filter as Data and CSV ·
                  missing durations excluded
                </p>
                {query && (
                  <Button
                    variant="outline"
                    disabled={saved.blocked}
                    onClick={() => saved.update({ query: "" })}
                  >
                    Clear data filter
                  </Button>
                )}
                {!rows.some((r) => r.minutes !== null) && (
                  <p role="status">
                    No recorded durations match the current filter.
                  </p>
                )}
                <div className="sample-chart">
                  {rows
                    .filter((r) => r.minutes !== null)
                    .map((r) => (
                      <div key={r.id}>
                        <span>{r.id}</span>
                        <div>
                          <i style={{ width: `${(r.minutes! / 60) * 100}%` }} />
                        </div>
                        <b>{r.minutes} min</b>
                      </div>
                    ))}
                </div>
                <p className="muted small">
                  Axis: 0–60 minutes. Exact values appear beside every bar and
                  in the Data table. These six records cannot establish whether
                  rain causes delays.
                </p>
              </div>
            ) : (
              <>
                <label htmlFor="code">Python draft</label>
                <textarea
                  id="code"
                  className="code-editor"
                  value={code}
                  maxLength={10000}
                  disabled={saved.blocked}
                  onChange={(e) => saved.update({ code: e.target.value })}
                  spellCheck={false}
                />
                <p className="small muted">
                  Editable layout preview · Monaco and isolated Pyodide
                  execution arrive in Phase 4.
                </p>
                <div className="output">
                  <p className="eyebrow">OUTPUT</p>
                  <p>
                    No code has been executed. The Python engine is not
                    connected.
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={saved.blocked}
                  onClick={() => saved.update({ code: starter })}
                >
                  <RotateCcw size={14} />
                  Reset draft
                </Button>
              </>
            )}
          </div>
        </section>
        <aside
          className={`panel mentor-pane ${mobile === "Mentor" ? "mobile-active" : ""}`}
        >
          <div className="section-top">
            <span className="icon-tile">
              <Sparkles size={21} />
            </span>
            <Badge>OFFLINE</Badge>
          </div>
          <h2>
            A little guidance.
            <br />
            Your own discovery.
          </h2>
          <p className="muted">
            The context-aware AI Mentor arrives in Phase 6. No model is
            connected and no text is sent to a provider.
          </p>
          <div className="mentor-message">
            <p className="eyebrow">AUTHORED THINKING PROMPT</p>
            <p>
              Before comparing rainy and clear days, what else might differ
              between these deliveries?
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setGuide(!guide)}
            aria-expanded={guide}
          >
            {guide ? "Hide conceptual hint" : "Reveal conceptual hint"}
          </Button>
          {guide && (
            <p className="hint" role="status">
              Consider distance and rush hour. A fair comparison should account
              for differences in both.
            </p>
          )}
        </aside>
      </div>
      <DraftActions draft={saved} />
      <div className="workspace-footer">
        <span>
          <span className="status-dot" />
          Table, chart and CSV share the current data filter.
        </span>
        <span>Execution and assessment are not connected.</span>
      </div>
    </>
  );
}
