import {
  validateBody,
  validateDraft,
  type Draft,
  type DraftBody,
} from "./schema";
const prefix = "datum:guest:v1:";
import { clearGuestRecovery } from "./recovery";
export class DraftConflict extends Error {
  constructor() {
    super(
      "This draft changed elsewhere. Copy your edits if needed, then reload the saved draft.",
    );
  }
}
export function readGuest(id: string): Draft | null {
  const raw = localStorage.getItem(prefix + id);
  if (!raw) return null;
  const draft = validateDraft(JSON.parse(raw));
  if (draft.content_id !== id)
    throw new Error("Guest draft identity does not match.");
  return draft;
}
export async function saveGuest(
  id: string,
  body: DraftBody,
  revision: number,
): Promise<Draft> {
  const write = () => {
    validateBody(id, body);
    const old = readGuest(id);
    if (old && JSON.stringify(old.body) === JSON.stringify(body)) return old;
    if ((old?.revision ?? 0) !== revision) throw new DraftConflict();
    const draft: Draft = {
      content_id: id,
      content_version: 1,
      body,
      revision: revision + 1,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(prefix + id, JSON.stringify(draft));
    return draft;
  };
  return navigator.locks
    ? navigator.locks.request(prefix + id, write)
    : write();
}
export function listGuest(): Draft[] {
  const result: Draft[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      const draft = readGuest(key.slice(prefix.length));
      if (draft) result.push(draft);
    }
  }
  return result;
}
export function clearGuest() {
  clearGuestRecovery();
  for (const draft of listGuest())
    localStorage.removeItem(prefix + draft.content_id);
}
