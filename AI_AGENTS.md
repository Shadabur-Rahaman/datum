# AI gateway contract — V2 Milestone 2.4 (not implemented)

No provider is connected in Milestone 2.1. Auth and persistence do not enable any AI provider. Every visible hint is authored and explicitly labeled. No model output, execution or numerical result is fabricated.

One Supabase Edge Function will authenticate the JWT, verify resource ownership, validate bounded input with Zod and choose a single role. A provider interface will support Gemini first and optional Groq fallback, with environment-configured model IDs. Browser requests contain context IDs, role, bounded user text and requested hint level. Server reads owned context and supplies deterministic computed facts.

Roles: Socratic Mentor (four progressive hint levels); Code Debugger (actual code/traceback; never claims execution); Evidence Reviewer (checks claims against provided facts, flags limitations); Learning Navigator (explains deterministic recommendations). Provider responses must match a schema with role, message, questions, hint level and provenance. Reject malformed responses rather than treating raw text as validated feedback.

Before release: per-user atomic usage limits, strict context/output budgets, timeout, bounded exponential backoff, explicitly labeled deterministic fallback, cache scoped by user and content version, minimal metadata logging and retention policy. Prompt content is untrusted; no model output can authorize grade changes. Secrets: GEMINI_API_KEY/GEMINI_MODEL and optional GROQ_API_KEY/GROQ_MODEL only in Supabase secrets. Never in VITE_* variables. Navigator must function without AI.


## V2.2 roles and bounded context

One gateway serves four logical roles, not continuously running agents. Tutor receives lesson objectives and actual computed activity results. Debugger receives excerpts of the last real Pyodide run's code, stdout and traceback with timestamp and row count; later edits are not silently represented as executed. Reviewer receives the executed lab configuration and computed summaries. Navigator receives deterministic recommendations and verified evidence summaries.

The last ten exchanges persist as an owner-scoped document; only the last two enter the next request. Authored progressive hints work without a provider and are labeled as authored. Current context and message excerpts are size-bounded. The server still limits request body/context/prompt, output tokens and schema; it refuses grade fields. Credentials stay in Edge secrets. A primary Gemini failure can make exactly one Groq fallback if configured, with another consume_mentor_budget call. Both provider failures return 503 and the UI retains work. my_mentor_usage exposes only the caller's UTC-day and last-minute request counts, including charged failures/fallbacks. Usage counts are requests, not fabricated token counts.

BLOCKED: actual provider credentials, hosted endpoint acceptance and live pedagogical quality. Local contract tests mock network responses and cannot certify model quality.

Tutor/reviewer, debugger and navigator contexts use separate bounded conversation documents so simultaneously mounted lab and debugger panels cannot overwrite each other's saved conversation.
