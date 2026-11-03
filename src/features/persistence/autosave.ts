import { persistDraft } from "./repository";
import { recovery, writeRecovery, removeRecovery } from "./recovery";
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const flights = new Map<string, Promise<boolean>>();
export const saveEvent = "datum:save-state";
function emit(key: string, detail: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent(saveEvent, { detail: { key, ...detail } }),
  );
}
export function scheduleSave(owner: string | null, id: string) {
  const key = `${owner ?? "guest"}:${id}`;
  clearTimeout(timers.get(key));
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      void flushSave(owner, id);
    }, 1200),
  );
}
export function flushSave(owner: string | null, id: string): Promise<boolean> {
  const key = `${owner ?? "guest"}:${id}`;
  clearTimeout(timers.get(key));
  timers.delete(key);
  const running = flights.get(key);
  if (running) return running;
  const snapshot = recovery.get(key);
  if (!snapshot) return Promise.resolve(true);
  if (owner && navigator.onLine === false) {
    emit(key, {
      error:
        "Offline. Recovery is saved on this device; account sync is pending.",
    });
    return Promise.resolve(false);
  }
  emit(key, { saving: true });
  const job = (async () => {
    try {
      const saved = await persistDraft(
        owner,
        id,
        snapshot.body,
        snapshot.revision,
      );
      const latest = recovery.get(key);
      if (latest === snapshot) {
        removeRecovery(key);
      } else if (latest) {
        writeRecovery(key, { ...latest, revision: saved.revision });
        scheduleSave(owner, id);
      }
      emit(key, { revision: saved.revision, saved: true });
      return true;
    } catch (e) {
      emit(key, {
        error:
          e instanceof Error
            ? e.message
            : "Sync failed. Recovery remains on this device. Retry saving.",
      });
      return false;
    } finally {
      flights.delete(key);
      emit(key, { saving: false });
    }
  })();
  flights.set(key, job);
  return job;
}
