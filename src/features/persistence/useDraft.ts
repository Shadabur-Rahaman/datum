import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { loadDraft } from "./repository";
import type { DraftBody } from "./schema";
import { validateBody } from "./schema";
import {
  recovery,
  readRecovery,
  writeRecovery,
  removeRecovery,
} from "./recovery";
import { flushSave, scheduleSave, saveEvent } from "./autosave";
export function useDraft<T extends DraftBody>(id: string, initial: T) {
  const { user, loading: authLoading, error: authError } = useAuth(),
    owner = user?.id ?? null,
    key = `${owner ?? "guest"}:${id}`;
  const [body, setBody] = useState(initial),
    [revision, setRevision] = useState(0),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [dirty, setDirty] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [reload, setReload] = useState(0);
  const latest = useRef({ body, revision });
  latest.current = { body, revision };
  const initialRef = useRef(initial);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setMessage("");
    setDirty(false);
    setBody(initialRef.current);
    setRevision(0);
    if (authLoading || authError) return;
    let pending: ReturnType<typeof readRecovery>;
    try {
      pending = readRecovery(key);
      if (pending) validateBody(id, pending.body);
    } catch {
      setError(
        "Recovery could not be read. Existing data has not been replaced.",
      );
      setLoading(false);
      return;
    }
    if (pending) {
      setBody(pending.body as T);
      setRevision(pending.revision);
      setDirty(true);
    }
    void loadDraft(owner, id)
      .then((saved) => {
        if (!active) return;
        if (pending) {
          setMessage("Recovered pending edits from this device.");
          if (
            saved &&
            saved.revision !== pending.revision &&
            JSON.stringify(saved.body) !== JSON.stringify(pending.body)
          )
            setError(
              "This draft changed elsewhere. Copy your edits if needed, then reload the saved draft.",
            );
          else scheduleSave(owner, id);
        } else if (saved) {
          setBody(saved.body as T);
          setRevision(saved.revision);
          setMessage(
            owner
              ? "Restored from your account."
              : "Restored from this device.",
          );
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
        setError(
          pending
            ? "Offline or sync failed. Recovered edits remain on this device."
            : "Could not load your saved draft. Retry loading before editing; existing data has not been replaced.",
        );
      });
    return () => {
      active = false;
    };
  }, [owner, id, authLoading, authError, reload]);
  useEffect(() => {
    function changed(event: Event) {
      const d = (event as CustomEvent).detail;
      if (d.key !== key) return;
      if (d.saving !== undefined) setSaving(d.saving);
      if (d.error) {
        setError("Save failed. " + d.error);
        setMessage("");
      }
      if (d.saved) {
        const pending = recovery.get(key);
        setRevision(d.revision);
        setDirty(!!pending);
        setError("");
        setMessage(owner ? "Saved to your account." : "Saved on this device.");
      }
    }
    function online() {
      if (recovery.has(key)) scheduleSave(owner, id);
    }
    window.addEventListener(saveEvent, changed);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener(saveEvent, changed);
      window.removeEventListener("online", online);
    };
  }, [key, owner, id]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(patch: Partial<T>) {
    if (loading || authLoading || authError) return;
    const next = { ...latest.current.body, ...patch };
    latest.current.body = next;
    setBody(next);
    setDirty(true);
    setMessage("Saving shortly. Recovery is stored on this device.");
    try {
      writeRecovery(key, { body: next, revision: latest.current.revision });
      setError("");
      scheduleSave(owner, id);
    } catch {
      setError(
        "Browser recovery storage is unavailable. Keep this page open and retry Save draft.",
      );
    }
  }
  async function save() {
    if (loading || authLoading || authError) return false;
    return flushSave(owner, id);
  }
  return {
    body,
    update,
    save,
    reload: () => {
      if (saving) return;
      removeRecovery(key);
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
      !!authError ||
      (!!error && revision === 0 && !dirty),
    cloud: !!owner,
  };
}
