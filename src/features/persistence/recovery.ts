import type { DraftBody } from "./schema";
export type Pending = { body: DraftBody; revision: number };
export const recovery = new Map<string, Pending>();
const prefix = "datum:recovery:v2:";
export function readRecovery(key: string): Pending | undefined {
  const memory = recovery.get(key);
  if (memory) return memory;
  const raw = localStorage.getItem(prefix + key);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  if (
    !parsed ||
    !Number.isInteger(parsed.revision) ||
    parsed.revision < 0 ||
    !parsed.body ||
    typeof parsed.body !== "object" ||
    raw.length > 750000
  )
    throw new Error(
      "Recovery data is invalid. Export browser data before clearing it.",
    );
  recovery.set(key, parsed);
  return parsed;
}
export function writeRecovery(key: string, value: Pending) {
  recovery.set(key, value);
  localStorage.setItem(prefix + key, JSON.stringify(value));
}
export function removeRecovery(key: string) {
  recovery.delete(key);
  localStorage.removeItem(prefix + key);
}
export function clearPrivateRecovery() {
  clearRecovery(false);
}
export function clearGuestRecovery() {
  clearRecovery(true);
}
function clearRecovery(guest: boolean) {
  for (const key of recovery.keys())
    if (key.startsWith("guest:") === guest) recovery.delete(key);
  try {
    for (const key of Object.keys(localStorage))
      if (
        key.startsWith(prefix) &&
        key.slice(prefix.length).startsWith("guest:") === guest
      )
        localStorage.removeItem(key);
  } catch {
    /* In-memory copies are still cleared; storage failures never become a guest import. */
  }
}
