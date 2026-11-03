import { it, expect } from "vitest";
import {
  chapterQuestions,
  chapterNames,
  publicPractice,
} from "./chapterQuestions";
import { gradePractice, chapterSessionSchema } from "./session";
it("covers six chapters with six distinct protected prompts each", () => {
  expect(chapterQuestions).toHaveLength(36);
  expect(new Set(chapterQuestions.map((q) => q.id)).size).toBe(36);
  chapterNames.forEach((_, i) =>
    expect(chapterQuestions.filter((q) => q.chapter === i)).toHaveLength(6),
  );
  for (const q of chapterQuestions) {
    expect(q).not.toHaveProperty("answer");
    expect(q).not.toHaveProperty("explanation");
    expect(q.objective.length).toBeGreaterThan(10);
  }
  expect(new Set(chapterQuestions.map((q) => q.kind))).toEqual(
    new Set([
      "single",
      "multi",
      "boolean",
      "numeric",
      "scenario",
      "output",
      "chart",
    ]),
  );
});
it("local practice has independent prompts and finite numerical grading", () => {
  for (const p of publicPractice) {
    expect(chapterQuestions.some((q) => q.prompt === p.prompt)).toBe(false);
    expect(gradePractice(p.answer, p.answer)).toBe(true);
    expect(gradePractice(p.answer + 1, p.answer)).toBe(false);
  }
  expect(gradePractice(NaN, 1)).toBe(false);
  expect(gradePractice(Infinity, 1)).toBe(false);
});
it("bounds quiz history and rejects malformed persisted cursors", () => {
  expect(
    chapterSessionSchema.safeParse({
      chapter: 0,
      mode: "practice",
      requestId: crypto.randomUUID(),
      cursor: 6,
      answers: {},
      startedAt: 0,
      timed: false,
      practiceHistory: [],
    }).success,
  ).toBe(false);
});
