import { it, expect } from "vitest";
import { selectMentorContext } from "./context";
import { parseInput } from "../../../supabase/functions/_shared/mentor";
it("retains actual code and traceback as separate bounded context fields", () => {
  const context = selectMentorContext(
    {
      code: "print(unknown_name)",
      error: "NameError: unknown_name is not defined",
      output: "",
      source: "real Pyodide worker",
    },
    [],
    1,
  );
  expect(context.current).toMatchObject({
    code: "print(unknown_name)",
    error: "NameError: unknown_name is not defined",
  });
  expect(() =>
    parseInput({ role: "debugger", prompt: "Help", context }),
  ).not.toThrow();
});
it("fits the gateway limit even with long quoted content and conversation history", () => {
  const context = selectMentorContext(
    {
      code: '"'.repeat(10000),
      error: "\\".repeat(10000),
      rows: Array(1000).fill({ name: '"'.repeat(2000) }),
    },
    Array(10).fill({ question: '"'.repeat(2000), hint: '"'.repeat(4000) }),
    3,
  );
  expect(JSON.stringify(context).length).toBeLessThanOrEqual(6000);
  expect(context.recent).toHaveLength(2);
  expect(() =>
    parseInput({ role: "debugger", prompt: "Help", context }),
  ).not.toThrow();
});
