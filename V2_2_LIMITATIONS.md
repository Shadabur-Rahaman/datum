# V2.2 limitations and status

## BLOCKED — external activation

No Supabase URL/publishable key or authorized hosted project was configured for this release. Hosted signup, email verification/reset, two-real-user cross-device synchronization, deployed Edge Functions and actual provider responses cannot be honestly certified. Local SQL uses real PostgreSQL and independent JWT-identity sessions; it is not hosted GoTrue or email delivery. Follow DEPLOYMENT.md and DATABASE.md before enabling cloud variables.

No actual Gemini/Groq provider credentials were used. The gateway and fallback are verified against mocked network boundaries. Model availability, pricing/free-tier quota and contextual quality require testing with the chosen currently available model. No model name is guessed or hardcoded as a free guarantee.

## VERIFIED design boundaries

- Quiz keys are inaccessible through the anonymous/authenticated database API and absent from browser question metadata. This public educational repository includes SQL fixtures; it is not a confidential high-stakes exam bank.
- The new bank has 36 protected questions plus the original 12. The separate guest practice bank has six questions, one per chapter. It does not expose the protected bank's exact answers. Numerical tolerance is 0.001; multi-select grading requires the complete exact set.
- Lesson calculations are JavaScript demonstrations, explicitly educational simulations. Actual Python runs in Pyodide. Lesson checks, notebook text, local practice and client challenge checks are unverified evidence; only trusted quiz RPC results feed verified competence.
- The objective research rubric checks presence, execution and nonempty computed observations. It does not semantically validate a written causal claim or award an authoritative research grade. Students must interpret and qualify their findings.
- Browser recovery is plaintext local storage scoped by owner ID, appropriate only for the current device; it is removed on sign-out. Use exports and finish sync before signing out. Clearing browser data can remove guest work. No service worker guarantees first-load offline availability.
- Durable drafts retain bounded data: notebook 30 entries, lesson and Python attempts 30 per document, public quiz history 30, configurations 30, snapshots 10, conversations 10. Import is atomic, at most 80 documents / 700 KB. Oversized imports fail without deleting the local copy.
- Notebook UUID conflicts keep the cloud copy. Other existing cloud drafts win wholesale; no automatic line-by-line code/reflection merge. New notebook entries are unioned without duplicate IDs. Over-capacity merges are rejected for explicit cleanup/export.
- Python supports standard library, pandas and NumPy; initial runtime/package load needs internet. Disposable workers time out at 10 seconds after loading; browser-wide hard memory isolation is not guaranteed.
- Mentor context is deliberately bounded. Long code/output/tracebacks are excerpts, not full files. The model does not run code, write grades or browse. Prompt injection defenses reduce risk, not a mathematical guarantee of model compliance.
- Verified skill indicators inspect latest responses per distinct objective in the last 30 days, within the latest 100 attempts retrieved. A competence indicator applies only to assessed objectives, not general intelligence or certification.

## DEFERRED — scale and independent acceptance

- Normalized per-entry cloud notebook storage and incremental server pagination; current bounded document pagination is local.
- Safari/WebKit and Firefox execution coverage; mobile tests use Chromium with iPhone-size emulation, not a physical iPhone.
- Independent human educational review and live-provider quality evaluations. No independent reviewer was invented.
- Production error-rate/latency monitoring infrastructure and a separate staging deployment are not configured. Local production preview and published guest smoke are the available checks.
