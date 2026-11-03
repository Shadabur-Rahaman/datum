import { it, expect } from "vitest";
import { mastery, recommend } from "./recommendations";
import type { QuizAttempt } from "./useJourney";
const at = new Date().toISOString();
const quiz = (ids: string[], correct = true): QuizAttempt => ({
  id: crypto.randomUUID(),
  created_at: at,
  verified_score: correct ? 1 : 0,
  responses: {},
  feedback: ids.map((id) => ({
    id,
    skill: "Data literacy",
    correct,
    explanation: "Reason",
  })),
});
it("requires distinct recent server-graded objectives rather than repeated attempts", () => {
  expect(
    mastery([quiz(["a"]), quiz(["a"]), quiz(["a"]), quiz(["a"])])[0].state,
  ).toBe("Building evidence");
  expect(mastery([quiz(["a", "b", "c", "d"])])[0].state).toBe(
    "Competent on assessed objectives",
  );
  expect(mastery([quiz(["a"], false)])[0].state).toBe("Needs review");
  expect(mastery([{ ...quiz(["a"]), verified_score: null }])).toEqual([]);
  expect(
    mastery([{ ...quiz(["a"]), created_at: "2020-01-01T00:00:00Z" }]),
  ).toEqual([]);
});
it("recommends without AI and explains missing or weak evidence", () => {
  expect(recommend([], []).to).toBe("/learn/observations");
  expect(recommend([], [quiz(["a"], false)]).to).toBe("/quiz");
});
