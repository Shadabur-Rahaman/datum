import { useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { loadDraft, persistDraft } from "../persistence/repository";
export function useLastLesson(id: string | undefined) {
  const { user, loading, error } = useAuth();
  useEffect(() => {
    if (!id || loading || error) return;
    let active = true;
    void loadDraft(user?.id ?? null, "learner-navigation")
      .then((old) => {
        if (active)
          return persistDraft(
            user?.id ?? null,
            "learner-navigation",
            { lastLesson: id },
            old?.revision ?? 0,
          );
      })
      .catch(() => {
        /* Resume location is optional; never replace or block an authored draft. */
      });
    return () => {
      active = false;
    };
  }, [id, user?.id, loading, error]);
}
