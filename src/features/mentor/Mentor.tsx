import { useState } from "react";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { supabase } from "../../services/supabase";
import { useAuth } from "../auth/AuthProvider";
export const mentorResponse = z
  .object({
    question: z.string().max(2000),
    hint: z.string().max(4000),
    limitation: z.string().max(2000),
  })
  .strict();
export default function Mentor({ context }: { context: unknown }) {
  const { user } = useAuth();
  const [role, setRole] = useState("tutor"),
    [prompt, setPrompt] = useState(""),
    [reply, setReply] = useState<z.infer<typeof mentorResponse> | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function ask() {
    if (!supabase || !user) return;
    setBusy(true);
    setError("");
    setReply(null);
    try {
      const { data, error } = await supabase.functions.invoke("mentor", {
        body: { role, prompt, context },
      });
      if (error) throw error;
      setReply(mentorResponse.parse(data));
    } catch {
      setError(
        "Live AI is unavailable. Your work is unchanged. Use the authored guide below or try again later.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="eyebrow">MENTOR</p>
      <h2>Make the evidence speak.</h2>
      <p className="small muted">
        {supabase && user
          ? "AI guidance can be mistaken. Check claims against your measurements."
          : "Live AI requires a configured cloud account and provider. The guide below is authored, not AI-generated."}
      </p>
      <label>
        Mentor role
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="tutor">Socratic tutor</option>
          <option value="debugger">Python debugger</option>
          <option value="reviewer">Evidence reviewer</option>
        </select>
      </label>
      <label>
        Your question
        <textarea
          maxLength={2000}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What should I check next? Paste code and traceback for debugging."
        />
      </label>
      <Button
        disabled={!supabase || !user || busy || !prompt.trim()}
        onClick={() => void ask()}
      >
        {busy ? "Asking mentor…" : "Ask live mentor"}
      </Button>
      {error && <p role="alert">{error}</p>}
      {reply && (
        <div className="insight">
          <div>
            <strong>AI-generated guidance</strong>
            <p>{reply.question}</p>
            <p>{reply.hint}</p>
            <p>{reply.limitation}</p>
          </div>
        </div>
      )}
      <details open>
        <summary>Authored investigation guide</summary>
        <ol>
          <li>Which records changed in your experiment?</li>
          <li>Did missing values or outliers affect the mean?</li>
          <li>Could distance or rush hour explain the difference?</li>
          <li>What would you need to establish causation?</li>
        </ol>
      </details>
    </>
  );
}
