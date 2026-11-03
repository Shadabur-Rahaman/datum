import type { DraftBody } from "./schema";
export const recovery = new Map<
  string,
  { body: DraftBody; revision: number }
>();
export function clearPrivateRecovery() {
  for (const key of recovery.keys())
    if (!key.startsWith("guest:")) recovery.delete(key);
}
export function clearGuestRecovery() {
  for (const key of recovery.keys())
    if (key.startsWith("guest:")) recovery.delete(key);
}
