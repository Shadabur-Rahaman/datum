# DATUM V2.1 product upgrade (package 0.2.2)

This release preserves the Phase 1 interface and V2.1 saved-work foundation. It adds a working guest learning path; it does not claim that an unconfigured cloud backend or AI provider is live.

## Implemented

- Dashboard counts real saved reflections, practice runs, notebook findings and server assessment records. Empty accounts start empty. Resume location is separate from evidence.
- The hypothesis lesson includes a worked example, analogy, adjustable experiment, prediction checkpoint, misconception feedback and mini-challenge. All twelve original lessons remain available; eleven retain their explicitly labeled previews.
- Delivery Delay uses 1,000 deterministic synthetic records, seed 20261103, dataset version 1. Filters, missing-value treatment, outlier exclusion and seeded sampling share one pipeline. Table visibility search is explicitly separate from analysis filters. Summaries, group charts, Python input and CSV agree.
- A hypothesis, prediction, run, explanation, limitation and reflection form the evidence loop. The notebook stores dataset/version/seed/config/code references; findings, limitations and reflections are editable, exportable and reopenable.
- Actual Pyodide 314.0.7 runs in disposable module workers. pandas/NumPy load on demand, output is bounded, execution times out after 10 seconds and runtime loading after 120 seconds. Monaco is optional and loaded only on request; an accessible text editor remains available on mobile. Six challenges have two deterministic cases each.
- Twelve authored quiz questions cover all requested answer types. Option identity survives display shuffling. Answers/session IDs are saved before submission. SQL privately grades, records feedback, limits attempts and handles identical retries. The public educational repository contains the SQL solution bank, so this is not a secret high-stakes exam system.
- Skill DNA separates server-verified quiz objectives from unverified browser checks and learner-authored investigations. It shows recent performance and mistakes rather than manufacturing a mastery percentage.
- Unsaved drafts survive internal navigation in owner-scoped session memory. Explicit Save is required for durable recovery after closing; refresh/close warns while a mounted draft is dirty. Save failures and conflicts preserve edits. Sign-out clears private recovery memory. No private account draft is copied to guest storage.
- Secure mentor/deletion Edge Functions: authenticated caller verification, bounded inputs, provider-output validation, fixed provider URLs, timeouts, no tools or grade-writing capability. Mentor quota: 3/minute and 20/day per user, 1,000/day globally, 512 output tokens/request. Provider billing limits must also be set; request budgets are not a monetary guarantee.

## External activation steps (not completed)

1. Supply a real Supabase project. Authenticate the CLI, link the intended project and review/apply migrations 001–004 with `npx supabase db push --include-seed`. No hosted database was reset or modified in this release.
2. Configure OTP email delivery and the production site URL. Test a real email roundtrip. Run `npm run test:supabase` against a disposable migrated test project using the documented test-only environment variables. That suite does not itself test SMTP.
3. Deploy `mentor` and `delete-account` with Supabase CLI; keep JWT verification enabled. Set server-only `AI_PROVIDER` (`gemini` or `groq`), `AI_MODEL`, `AI_API_KEY`, and `ALLOWED_ORIGINS`. Choose an available model and free-tier allowance in the provider account; no model or free quota is assumed. Supabase supplies its server URL/keys. Never put the service role or provider key in Vite/GitHub public variables.
4. Set GitHub Actions public variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, then rerun Pages. Only enable this after migrations and account acceptance tests pass.
5. Verify two real accounts: OTP, save/reload on a second device, ownership denial, quiz grading/history, quota errors, a real mentor response in each role, export and deletion of a disposable account.

## Known limits

Hosted Auth, SMTP, cloud sync/grading, provider replies and actual account deletion remain blocked by missing external configuration. Local SQL tests and mocked HTTP-boundary tests do not substitute for those checks. Full end-to-end cloud learning acceptance therefore remains blocked.

Eleven lesson previews still need progressive instructional expansion. No human screen-reader audit has been completed. The large Monaco chunk is intentionally lazy (roughly 676 KB compressed); it is absent from initial execution and never required to type code. Python requires an initial CDN connection and has no hard memory quota; worker termination bounds runtime but is not a server sandbox. Student code and checks can be modified by the learner and are never trusted for server grades. Notebook storage is capped at 30 findings; practice keeps the last 30 local runs per challenge; analytics reads the most recent 100 cloud quiz attempts.

## Deployment readiness and rollback

Pages retains `/datum/` and hash routes. CI gates on unit, real PostgreSQL, Edge boundary and desktop/mobile browser tests including real CDN-backed Python. `build-info.json` identifies the actual deployed source commit. This static deployment does not apply hosted SQL or publish Edge Functions.

Rollback trigger: broken navigation, guest-save regression, missing assets or Python worker failures introduced by this build. Revert the release with a new Git commit and let the existing Pages workflow redeploy; do not rewrite history. Existing original drafts remain readable at `/investigate/legacy`. New additive database tables need no destructive rollback. There is no production monitoring service configured; workflow status and live browser smoke checks are the available evidence.

Official API references checked during implementation: [Pyodide workers](https://pyodide.org/en/stable/usage/webworker.html), [Gemini generation API](https://ai.google.dev/api/generate-content), [Groq structured output](https://console.groq.com/docs/structured-outputs), [Supabase function authentication](https://supabase.com/docs/guides/functions/auth).
