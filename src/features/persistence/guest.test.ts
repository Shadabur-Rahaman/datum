import { describe, it, expect, vi } from "vitest";
import {
  saveGuest,
  readGuest,
  listGuest,
  clearGuest,
  DraftConflict,
} from "./guest";
import { validateBody, validateDraft } from "./schema";
describe("guest persistence", () => {
  it("accepts real Postgres timestamp offsets and singleton RPC rows", () => {
    const draft = {
      content_id: "observations",
      content_version: 1,
      body: { reflection: "cloud" },
      revision: 1,
      updated_at: "2026-11-03T12:00:00.123456+00:00",
    };
    expect(validateDraft([draft]).body).toEqual({ reflection: "cloud" });
  });
  it("roundtrips drafts and keeps distinct content separate", async () => {
    await saveGuest("observations", { reflection: "A" }, 0);
    await saveGuest("hypotheses", { reflection: "B" }, 0);
    expect(readGuest("observations")?.body).toEqual({ reflection: "A" });
    expect(listGuest()).toHaveLength(2);
  });
  it("retries identical writes idempotently and rejects stale edits", async () => {
    await saveGuest("observations", { reflection: "A" }, 0);
    expect(
      (await saveGuest("observations", { reflection: "A" }, 0)).revision,
    ).toBe(1);
    await saveGuest("observations", { reflection: "B" }, 1);
    await expect(
      saveGuest("observations", { reflection: "C" }, 1),
    ).rejects.toBeInstanceOf(DraftConflict);
    expect(readGuest("observations")?.body).toEqual({ reflection: "B" });
  });
  it("rejects forged scores, excessive input and unknown content", () => {
    expect(() =>
      validateBody("observations", { reflection: "a", verified_score: 1 }),
    ).toThrow();
    expect(() =>
      validateBody("observations", { reflection: "x".repeat(2001) }),
    ).toThrow();
    expect(() => validateBody("unknown", { reflection: "a" })).toThrow();
    expect(() =>
      validateBody("delivery-delay", {
        hypothesis: "",
        code: "",
        query: "",
        panel: null,
      }),
    ).toThrow();
  });
  it("reports corrupt storage rather than overwriting it", async () => {
    localStorage.setItem("datum:guest:v1:observations", "bad");
    expect(() => readGuest("observations")).toThrow();
    await expect(
      saveGuest("observations", { reflection: "new" }, 0),
    ).rejects.toThrow();
    expect(localStorage.getItem("datum:guest:v1:observations")).toBe("bad");
  });
  it("propagates unavailable storage without a fake save", async () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Quota exceeded");
      });
    await expect(
      saveGuest("observations", { reflection: "new" }, 0),
    ).rejects.toThrow("Quota exceeded");
    spy.mockRestore();
    expect(readGuest("observations")).toBeNull();
  });
  it("clears only guest work, preserving theme and session keys", async () => {
    localStorage.setItem("datum-theme", "light");
    localStorage.setItem("sb-example-auth-token", "session");
    await saveGuest("observations", { reflection: "A" }, 0);
    clearGuest();
    expect(listGuest()).toHaveLength(0);
    expect(localStorage.getItem("datum-theme")).toBe("light");
    expect(localStorage.getItem("sb-example-auth-token")).toBe("session");
  });
});
