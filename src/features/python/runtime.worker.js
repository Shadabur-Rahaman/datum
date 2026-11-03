// Dedicated disposable module worker. No account, cookies, tokens or secrets are passed here.
const base = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
self.onmessage = async ({ data }) => {
  let output = "";
  const emit = (text) => {
    output = (output + text + "\n").slice(-20000);
  };
  try {
    self.postMessage({ type: "loading" });
    const { loadPyodide } = await import(
      /* @vite-ignore */ base + "pyodide.mjs"
    );
    const py = await loadPyodide({
      indexURL: base,
      stdout: emit,
      stderr: emit,
    });
    const packages = ["numpy", "pandas"].filter((name) =>
      new RegExp("\\b" + name + "\\b").test(data.code),
    );
    if (packages.length) await py.loadPackage(packages);
    py.globals.set("_rows_json", JSON.stringify(data.rows ?? []));
    await py.runPythonAsync("import json\nrows = json.loads(_rows_json)");
    self.postMessage({ type: "ready" });
    await py.runPythonAsync(data.code);
    let checks = [];
    if (data.tests) {
      py.globals.set("_tests_json", JSON.stringify(data.tests));
      const results = await py.runPythonAsync(`
_checks = []
for _case in json.loads(_tests_json):
    try:
        _actual = solve(_case['input'])
        if hasattr(_actual, 'item'): _actual = _actual.item()
        _expected = _case['expected']
        _ok = abs(_actual - _expected) < 1e-6 if isinstance(_expected, (float, int)) and not isinstance(_expected, bool) else _actual == _expected
        _checks.append({'name': _case['name'], 'passed': bool(_ok), 'actual': repr(_actual)[:200]})
    except Exception as _err:
        _checks.append({'name': _case['name'], 'passed': False, 'actual': str(_err)[:200]})
json.dumps(_checks)`);
      checks = JSON.parse(results);
    }
    self.postMessage({
      type: "done",
      output: output || "Execution finished without printed output.",
      checks,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      output,
      error: String(error).slice(-8000),
    });
  }
};
