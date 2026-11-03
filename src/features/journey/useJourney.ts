import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../../services/supabase";
import { listGuest } from "../persistence/guest";
import { validateDraft, type Draft } from "../persistence/schema";
export type QuizAttempt = {
  id: string;
  request_id?: string;
  created_at: string;
  verified_score: number | null;
  responses: Record<string, unknown>;
  feedback?: {
    id: string;
    skill: string;
    correct: boolean;
    explanation: string;
  }[];
};
export function useJourney() {
  const { user, loading: authLoading } = useAuth(),
    [drafts, setDrafts] = useState<Draft[]>([]),
    [quizzes, setQuizzes] = useState<QuizAttempt[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setDrafts([]);
    setQuizzes([]);
    if (authLoading) return;
    async function load() {
      try {
        if (!user) {
          const result = listGuest();
          if (active) setDrafts(result);
        } else {
          if (!supabase) throw new Error();
          const results = await Promise.all([
            supabase.from("user_drafts").select("*"),
            supabase.from("learning_documents").select("*"),
            supabase
              .from("quiz_attempts")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(100),
          ]);
          for (const r of results) if (r.error) throw r.error;
          if (active) {
            setDrafts(
              [...results[0].data!, ...results[1].data!].map(validateDraft),
            );
            setQuizzes(results[2].data!);
          }
        }
      } catch {
        if (active)
          setError(
            "Saved progress could not be loaded. Your existing records have not been changed.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [user?.id, authLoading]);
  return { drafts, quizzes, loading, error };
}
