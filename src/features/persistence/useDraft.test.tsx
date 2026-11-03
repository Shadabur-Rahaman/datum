import { act, renderHook, waitFor } from "@testing-library/react";
import { it, expect, vi, beforeEach } from "vitest";
import { useDraft } from "./useDraft";
const state = vi.hoisted(() => ({
  auth: { user: null as { id: string } | null, loading: false, error: "" },
  load: vi.fn(),
  save: vi.fn(),
}));
vi.mock("../auth/AuthProvider", () => ({ useAuth: () => state.auth }));
vi.mock("./repository", () => ({
  loadDraft: state.load,
  persistDraft: state.save,
}));
beforeEach(() => {
  state.auth = { user: null, loading: false, error: "" };
  state.load.mockReset();
  state.save.mockReset();
  state.load.mockResolvedValue(null);
});
it("isolates account changes and ignores stale cloud loads", async () => {
  let release: (value: unknown) => void = () => {};
  state.auth.user = { id: "A" };
  state.load.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const { result, rerender } = renderHook(() =>
    useDraft("observations", { reflection: "" }),
  );
  state.auth.user = { id: "B" };
  rerender();
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () =>
    release({ body: { reflection: "private A" }, revision: 1 }),
  );
  expect(result.current.body.reflection).toBe("");
});
it("does not import guest work automatically on login", async () => {
  state.load.mockResolvedValueOnce({
    body: { reflection: "guest" },
    revision: 1,
  });
  const { result, rerender } = renderHook(() =>
    useDraft("observations", { reflection: "" }),
  );
  await waitFor(() => expect(result.current.body.reflection).toBe("guest"));
  state.auth.user = { id: "A" };
  rerender();
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.body.reflection).toBe("");
  expect(state.save).not.toHaveBeenCalled();
});
it("keeps edits after failed save and allows retry", async () => {
  const { result } = renderHook(() =>
    useDraft("observations", { reflection: "" }),
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.update({ reflection: "work" }));
  state.save.mockRejectedValueOnce(new Error("offline"));
  await act(async () => result.current.save());
  expect(result.current.body.reflection).toBe("work");
  expect(result.current.dirty).toBe(true);
  expect(result.current.error).toContain("Save failed");
  state.save.mockResolvedValueOnce({ revision: 1 });
  await act(async () => result.current.save());
  expect(result.current.dirty).toBe(false);
  expect(result.current.message).toContain("Saved on this device");
});
