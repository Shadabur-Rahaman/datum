import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { loadDraft, persistDraft } from "./repository";
import { DraftConflict } from "./guest";
import type { DraftBody } from "./schema";
// Session-only recovery survives route unmounts without copying private cloud work
// into guest/browser storage. Explicit saves remain the durability boundary.
import { recovery } from "./recovery";

export function useDraft<T extends DraftBody>(id: string, initial: T) {
  const { user, loading: authLoading, error: authError } = useAuth();
  const owner = user?.id ?? null;
  const recoveryKey = `${owner ?? "guest"}:${id}`;
  const [body, setBody] = useState<T>(initial);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const epoch = useRef(0);
  const identity = useRef(owner);
  identity.current = owner;
  const initialRef = useRef(initial);
  useEffect(() => {
    const current = ++epoch.current;
    setBody(initialRef.current);
    setRevision(0);
    setDirty(false);
    setMessage("");
    setError("");
    setLoading(true);
    setSaving(false);
    if (authLoading || authError) return;
    loadDraft(owner, id)
      .then((saved) => {
        if (current !== epoch.current) return;
        if (saved) {
          setBody(saved.body as T);
          setRevision(saved.revision);
          setMessage(
            owner
              ? "Restored from your account."
              : "Restored from this device.",
          );
        }
        const pending = recovery.get(recoveryKey);
        if (pending) {
          setBody(pending.body as T);
          setRevision(pending.revision);
          setDirty(true);
          setMessage(
            "Restored unsaved edits from this session. Save to keep them after closing.",
          );
        }
        setLoading(false);
      })
      .catch(() => {
        if (current === epoch.current) {
          setLoading(false);
          setError(
            "Could not load your saved draft. Retry loading before editing; existing data has not been replaced.",
          );
        }
      });
    return () => {
      epoch.current++;
    };
  }, [owner, id, authLoading, authError, reload]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function save() {
    if (loading || saving || authError) return;
    const current = epoch.current;
    const originalOwner = owner;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await persistDraft(owner, id, body, revision);
      if (current !== epoch.current || identity.current !== originalOwner)
        return;
      setRevision(saved.revision);
      recovery.delete(recoveryKey);
      setDirty(false);
      setMessage(owner ? "Saved to your account." : "Saved on this device.");
      return true;
    } catch (failure) {
      if (current === epoch.current)
        setError(
          failure instanceof DraftConflict
            ? failure.message
            : "Save failed. Your edits are still here. Check your connection or browser storage and retry.",
        );
      return false;
    } finally {
      if (current === epoch.current) setSaving(false);
    }
  }
  return {
    body,
    update: (patch: Partial<T>) => {
      if (loading || saving || authLoading || authError) return;
      setBody((old) => {
        const next = { ...old, ...patch };
        recovery.set(recoveryKey, { body: next, revision });
        return next;
      });
      setDirty(true);
      setMessage("");
    },
    save,
    reload: () => {
      recovery.delete(recoveryKey);
      setReload((n) => n + 1);
    },
    loading: loading || authLoading,
    saving,
    dirty,
    error: authError || error,
    message,
    blocked:
      loading ||
      authLoading ||
      saving ||
      !!authError ||
      (!!error && revision === 0 && !dirty),
    cloud: !!owner,
  };
}
