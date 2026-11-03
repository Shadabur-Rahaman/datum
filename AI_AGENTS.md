# AI gateway contract — V2 Milestone 2.4 (not implemented)

No provider is connected in Milestone 2.1. Auth and persistence do not enable any AI provider. Every visible hint is authored and explicitly labeled. No model output, execution or numerical result is fabricated.

One Supabase Edge Function will authenticate the JWT, verify resource ownership, validate bounded input with Zod and choose a single role. A provider interface will support Gemini first and optional Groq fallback, with environment-configured model IDs. Browser requests contain context IDs, role, bounded user text and requested hint level. Server reads owned context and supplies deterministic computed facts.

Roles: Socratic Mentor (four progressive hint levels); Code Debugger (actual code/traceback; never claims execution); Evidence Reviewer (checks claims against provided facts, flags limitations); Learning Navigator (explains deterministic recommendations). Provider responses must match a schema with role, message, questions, hint level and provenance. Reject malformed responses rather than treating raw text as validated feedback.

Before release: per-user atomic usage limits, strict context/output budgets, timeout, bounded exponential backoff, explicitly labeled deterministic fallback, cache scoped by user and content version, minimal metadata logging and retention policy. Prompt content is untrusted; no model output can authorize grade changes. Secrets: GEMINI_API_KEY/GEMINI_MODEL and optional GROQ_API_KEY/GROQ_MODEL only in Supabase secrets. Never in VITE_* variables. Navigator must function without AI.
