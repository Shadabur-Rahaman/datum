import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import type { Check } from "./challenges";
const CodeEditor = lazy(() => import("./CodeEditor"));
export type Result = { name: string; passed: boolean; actual: string };
export default function PythonPanel({
  code,
  onChange,
  rows = [],
  tests,
  onResult,
  starter = 'print("Hello, investigator")',
}: {
  code: string;
  onChange: (s: string) => void;
  rows?: unknown[];
  tests?: Check[];
  onResult?: (r: Result[]) => void;
  starter?: string;
}) {
  const [busy, setBusy] = useState(false),
    [output, setOutput] = useState("Python runs only when you press Run."),
    [rich, setRich] = useState(false),
    [checks, setChecks] = useState<Result[]>([]);
  const worker = useRef<Worker | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function stop() {
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  useEffect(() => () => stop(), []);
  function run() {
    stop();
    setBusy(true);
    setChecks([]);
    setOutput(
      "Loading Python runtime and requested packages… First load needs an internet connection.",
    );
    const w = new Worker(new URL("./runtime.worker.js", import.meta.url), {
      type: "module",
    });
    worker.current = w;
    const expire = (ms: number, label: string) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        stop();
        setBusy(false);
        setOutput(label);
      }, ms);
    };
    expire(
      120000,
      "Python could not load within two minutes. Check your connection and try again.",
    );
    w.onerror = () => {
      stop();
      setBusy(false);
      setOutput(
        "The Python worker could not start. Check your connection and retry.",
      );
    };
    w.onmessage = ({ data }) => {
      if (data.type === "ready") {
        setOutput("Executing Python…");
        expire(
          10000,
          "Execution stopped after 10 seconds. Check loops and reduce the input size, then run again.",
        );
      }
      if (data.type === "done" || data.type === "error") {
        stop();
        setBusy(false);
        setOutput(
          data.output +
            (data.error
              ? "\n" + data.error + "\n" + explainError(data.error)
              : ""),
        );
        if (data.type === "done" && tests) {
          setChecks(data.checks);
          onResult?.(data.checks);
        }
      }
    };
    w.postMessage({ code, rows, tests });
  }
  return (
    <div className="python-workspace">
      <p className="small muted">
        Real Python in a disposable browser worker. pandas and NumPy load when
        imported. Browser checks are practice feedback, not independently
        verified grades.
      </p>
      <Button variant="ghost" onClick={() => setRich(!rich)}>
        {rich ? "Use accessible text editor" : "Use Monaco editor"}
      </Button>
      {rich ? (
        <Suspense fallback={<p>Loading code editor…</p>}>
          <CodeEditor code={code} onChange={onChange} readOnly={busy} />
        </Suspense>
      ) : (
        <textarea
          className="code-editor"
          aria-label="Python code"
          spellCheck={false}
          value={code}
          maxLength={10000}
          disabled={busy}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <div className="action-row">
        <Button onClick={run} disabled={busy || !code.trim()}>
          {busy
            ? "Running Python…"
            : tests
              ? "Run practice checks"
              : "Run Python"}
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => onChange(starter)}
        >
          Reset code
        </Button>
        {busy && (
          <Button
            variant="outline"
            onClick={() => {
              stop();
              setBusy(false);
              setOutput("Execution cancelled. Your code is still here.");
            }}
          >
            Stop execution
          </Button>
        )}
      </div>
      <pre className="python-output" aria-label="Python console" role="status">
        {output}
      </pre>
      {checks.map((c) => (
        <p key={c.name}>
          {c.passed ? "Passed" : "Needs work"} · {c.name}: {c.actual}
        </p>
      ))}
    </div>
  );
}
export function explainError(error: string) {
  if (error.includes("ModuleNotFoundError"))
    return "This package is unavailable. This workspace supports Python standard modules, pandas and NumPy; check the import name.";
  if (error.includes("SyntaxError"))
    return "Python could not read this statement. Check punctuation, colons and indentation near the indicated line.";
  if (error.includes("IndexError"))
    return "The requested position is outside the list. The first index is 0; handle an empty list first.";
  if (error.includes("NameError"))
    return "A name was used before it was defined. Check spelling and assignment order.";
  if (error.includes("ZeroDivisionError"))
    return "The divisor was zero. Check whether your filtered dataset is empty.";
  return "Read the final traceback line, inspect the values involved, and try one small change.";
}
