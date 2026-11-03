import { supabase } from "../../services/supabase";
import { DraftConflict, readGuest, saveGuest } from "./guest";
import { validateBody, validateDraft, type DraftBody } from "./schema";
import { isDocument } from "../journey/schema";
export async function loadDraft(userId: string | null, id: string) {
  if (!userId) return readGuest(id);
  if (!supabase) throw new Error("Cloud connection is unavailable.");
  const { data, error } = await supabase
    .from(isDocument(id) ? "learning_documents" : "user_drafts")
    .select("*")
    .eq("user_id", userId)
    .eq("content_id", id)
    .eq("content_version", 1)
    .maybeSingle();
  if (error) throw error;
  return data ? validateDraft(data) : null;
}
export async function persistDraft(
  userId: string | null,
  id: string,
  body: DraftBody,
  revision: number,
) {
  validateBody(id, body);
  if (!userId) return saveGuest(id, body, revision);
  if (!supabase) throw new Error("Cloud connection is unavailable.");
  const { data, error } = await supabase.rpc(
    isDocument(id) ? "save_learning_document" : "save_draft",
    {
      p_content_id: id,
      p_version: 1,
      p_body: body,
      p_expected_revision: revision,
      p_owner: userId,
    },
  );
  if (error?.code === "40001") throw new DraftConflict();
  if (error) throw error;
  return validateDraft(data);
}
export function downloadJson(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
