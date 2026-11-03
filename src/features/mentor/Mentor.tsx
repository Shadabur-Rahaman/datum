import { selectMentorContext } from "./context";
import { useDraft } from "../persistence/useDraft";
import { conversationSchema } from "./schema";
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
export default function Mentor({
  context,
  defaultRole = "tutor",
}: {
  context: unknown;
  defaultRole?: string;
}) {
  const { user } = useAuth();
  const [role, setRole] = useState(defaultRole),
    [prompt, setPrompt] = useState(""),
    [reply, setReply] = useState<z.infer<typeof mentorResponse> | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const conversation = useDraft<z.infer<typeof conversationSchema>>(
    defaultRole === "debugger"
      ? "mentor-debugger-v22"
      : defaultRole === "navigator"
        ? "mentor-navigator-v22"
        : "mentor-conversation-v22",
    { turns: [] },
  );
  const turns = conversation.body.turns;
  const [hints, setHints] = useState(0);
  const [usage, setUsage] = useState("");
  async function refreshUsage() {
    if (!supabase || !user) return;
    const { data, error } = await supabase.rpc("my_mentor_usage");
    const parsed = z
      .object({
        today: z.number().int().nonnegative(),
        lastMinute: z.number().int().nonnegative(),
        dailyLimit: z.number().int(),
        minuteLimit: z.number().int(),
      })
      .safeParse(data);
    setUsage(
      error || !parsed.success
        ? "Usage is unavailable. Retry later."
        : `${parsed.data.today}/${parsed.data.dailyLimit} provider requests today (UTC); ${parsed.data.lastMinute}/${parsed.data.minuteLimit} in the last minute. Failed provider calls and fallback calls also consume quota.`,
    );
  }
  async function ask() {
    if (!supabase || !user) return;
    setBusy(true);
    setError("");
    setReply(null);
    try {
      const { data, error } = await supabase.functions.invoke("mentor", {
        body: {
          role,
          prompt,
          context: selectMentorContext(context, turns, hints),
        },
      });
      if (error) throw error;
      const parsed = mentorResponse.parse(data);
      setReply(parsed);
      conversation.update({
        turns: [
          ...turns,
          {
            at: new Date().toISOString(),
            role: role as "tutor" | "debugger" | "reviewer" | "navigator",
            question: prompt,
            hint: parsed.hint,
          },
        ].slice(-10),
      });
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
          <option value="navigator">Learning navigator</option>
        </select>
      </label>
      <label>
        Your question
        <textarea
          maxLength={2000}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What should I check next?"
        />
      </label>
      <Button
        disabled={
          !supabase || !user || busy || conversation.blocked || !prompt.trim()
        }
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
      <Button
        variant="outline"
        onClick={() => setHints((n) => Math.min(3, n + 1))}
      >
        Reveal next authored hint
      </Button>
      {hints > 0 && (
        <p role="status">
          Authored hint {hints}/3:{" "}
          {role === "debugger"
            ? [
                "Read the last traceback line and find the referenced statement.",
                "Inspect the types and values used on that line. Test a smaller input.",
                "Change one thing, rerun Python and compare the new output with your expectation.",
              ][hints - 1]
            : [
                "Name the specific claim you are testing and the relevant measurement.",
                "Compare the groups and check which records are missing or excluded.",
                "Explain the result with its units, sample size and one alternative explanation.",
              ][hints - 1]}
        </p>
      )}
      <p className="small muted">
        The last ten live exchanges autosave with your work; the last two
        provide context. Daily and per-minute request limits apply.
      </p>
      {conversation.error && (
        <p role="alert">Conversation sync: {conversation.error}</p>
      )}
      <details>
        <summary>Saved mentor conversation ({turns.length}/10)</summary>
        {turns.map((turn, i) => (
          <p key={turn.at + i}>
            <strong>
              {turn.role}: {turn.question}
            </strong>
            <br />
            {turn.hint}
          </p>
        ))}
        <Button
          variant="outline"
          disabled={conversation.blocked}
          onClick={() => conversation.update({ turns: [] })}
        >
          Clear saved conversation
        </Button>
      </details>
      {supabase && user && (
        <>
          <Button variant="outline" onClick={() => void refreshUsage()}>
            Refresh AI usage
          </Button>
          <p role="status">{usage}</p>
        </>
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
