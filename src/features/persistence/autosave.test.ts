import { describe, it, expect, vi, afterEach } from "vitest";
import {
  recovery,
  writeRecovery,
  readRecovery,
  clearPrivateRecovery,
} from "./recovery";
import { flushSave } from "./autosave";
import { persistDraft } from "./repository";
vi.mock("./repository", () => ({ persistDraft: vi.fn() }));
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});
describe("persistent autosave", () => {
  it("recovers after losing in-memory state and separates owners", () => {
    writeRecovery("guest:observations", {
      body: { reflection: "guest" },
      revision: 0,
    });
    writeRecovery("owner:observations", {
      body: { reflection: "private" },
      revision: 2,
    });
    recovery.clear();
    expect(readRecovery("owner:observations")?.body).toEqual({
      reflection: "private",
    });
    clearPrivateRecovery();
    recovery.clear();
    expect(readRecovery("owner:observations")).toBeUndefined();
    expect(readRecovery("guest:observations")?.body).toEqual({
      reflection: "guest",
    });
  });
  it("retains edits made while an earlier save is in flight", async () => {
    vi.useFakeTimers();
    let finish!: (v: any) => void;
    vi.mocked(persistDraft).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    writeRecovery("guest:observations", {
      body: { reflection: "first" },
      revision: 0,
    });
    const saving = flushSave(null, "observations");
    writeRecovery("guest:observations", {
      body: { reflection: "newest" },
      revision: 0,
    });
    finish({ revision: 1 });
    await saving;
    expect(readRecovery("guest:observations")).toEqual({
      body: { reflection: "newest" },
      revision: 1,
    });
    vi.mocked(persistDraft).mockResolvedValueOnce({ revision: 2 } as any);
    await flushSave(null, "observations");
    expect(readRecovery("guest:observations")).toBeUndefined();
  });
  it("keeps recovery when storage rejects a stale revision", async () => {
    writeRecovery("owner:observations", {
      body: { reflection: "keep me" },
      revision: 1,
    });
    vi.mocked(persistDraft).mockRejectedValueOnce(
      new Error("Document changed elsewhere"),
    );
    expect(await flushSave("owner", "observations")).toBe(false);
    expect(readRecovery("owner:observations")?.revision).toBe(1);
  });
});
