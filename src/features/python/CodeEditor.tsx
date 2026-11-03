import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/editor/editor.api.js";
import "monaco-editor/languages/definitions/python/register.js";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
(
  globalThis as typeof globalThis & { MonacoEnvironment: unknown }
).MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });
export default function CodeEditor({
  code,
  onChange,
  readOnly = false,
}: {
  code: string;
  onChange: (s: string) => void;
  readOnly?: boolean;
}) {
  return (
    <Editor
      height="300px"
      language="python"
      theme={
        document.documentElement.dataset.theme === "light" ? "vs" : "vs-dark"
      }
      value={code}
      onChange={(s) => onChange((s ?? "").slice(0, 10000))}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        ariaLabel: "Python code editor",
      }}
    />
  );
}
