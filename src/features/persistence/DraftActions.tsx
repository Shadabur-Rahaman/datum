import { Button } from "../../components/ui/button";
export function DraftActions({
  draft,
}: {
  draft: {
    blocked: boolean;
    loading: boolean;
    saving: boolean;
    dirty: boolean;
    error: string;
    message: string;
    cloud: boolean;
    save: () => Promise<unknown>;
    reload: () => void;
  };
}) {
  return (
    <div className="draft-actions">
      <p className="small muted">
        {draft.cloud ? "Account draft" : "Device-only guest draft"} · Not
        graded. Save before leaving this page.
      </p>
      <div className="action-row">
        <Button onClick={() => void draft.save()} disabled={draft.blocked}>
          {draft.saving ? "Saving…" : "Save draft"}
        </Button>
        <Button
          variant="outline"
          onClick={draft.reload}
          disabled={draft.loading || draft.saving}
        >
          {draft.dirty ? "Discard edits & reload" : "Reload saved draft"}
        </Button>
      </div>
      {draft.error ? (
        <p role="alert">{draft.error}</p>
      ) : (
        <p role="status">
          {draft.loading
            ? "Loading saved work…"
            : draft.dirty
              ? "Unsaved changes"
              : draft.message}
        </p>
      )}
    </div>
  );
}
