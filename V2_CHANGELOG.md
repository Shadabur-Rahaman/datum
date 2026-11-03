# 2026-11-03 — V2.1 product upgrade / package 0.2.2

Added living synthetic investigation, real worker-based Python and six challenges, functional evidence notebook and learner statistics, interactive hypothesis lesson, twelve-question SQL-graded assessment, and authenticated mentor/deletion handlers. Preserved existing guest/cloud draft APIs and legacy workspace. See V2_1_RELEASE.md and V2_1_FLAW_RESOLUTION_REPORT.md for scope, verification and external blockers.

# V2 changelog — 0.2.1

Date: 2026-11-03 (Asia/Calcutta). Scope: audit, foundation repairs and Milestone 2.1 only.

## Implemented

- Preserved visual identity, routes, authored content, demo dashboard composition and `/datum/` hash deployment.
- Correct Dashboard title; search indexes descriptions/questions/concepts/prompts; table/chart/download share one filter.
- Formatted existing source and extracted Lesson and Settings; new auth/persistence modules separate UI, validation and storage.
- Supabase email OTP request/verification with error states, session restoration/sign-out, profile edit and bounded network requests. Missing configuration is explicitly guest-only.
- Explicit guest/cloud saves, draft restoration, account-switch isolation, optimistic revision conflicts and idempotent retries. Save status never implies grading.
- Atomic explicit guest migration: keep existing cloud drafts, retain device backup. Guest and account JSON export. Documented server-side account deletion/retention design; no fake deletion endpoint.
- SQL profiles/catalog/drafts/lesson progress/mission sessions and server-controlled quiz/practice attempts. Private empty solution schema, owner RLS, FK integrity, protected grades, timestamps and indexes.
- CI gates Pages deployment on browser checks and real PostgreSQL ownership tests, not just a frontend build.

## Files changed

Source: App, main, pages/Dashboard (format only), Learn, new Lesson/Settings, Investigate, shared UI/content/helpers (format only), styles, new services/supabase and features/auth + features/persistence modules/tests. Infrastructure: supabase/migrations, seed, config and OTP template; scripts/test-database and test-supabase; workflow, package/lock, env template and ignores. Tests: existing route tests retained/adapted, new guest/auth/state tests, production Pages-mode Playwright config and persistence browser suite. Documentation: V2_AUDIT, V2_PLAN, this report, README, ARCHITECTURE, DATABASE, AI_AGENTS, TESTING and DEPLOYMENT.

## Executed checks

- Baseline: Pages build PASS; 16 unit tests PASS; 20 browser tests PASS.
- Final production Pages build: PASS.
- Unit tests: 29 PASS, including mocked OTP UI (not a claim of real Auth connectivity).
- Real isolated PostgreSQL: 31 PASS using two independent authenticated identity sessions. Includes cross-user denial, owner/score/identity protection, stale concurrent saves, atomic import rollback, type/parent integrity, export and deletion cascades.
- Production Pages-mode browser checks: 30 PASS on desktop/mobile, including guest recovery, unavailable storage, stale tabs, linked filters, keyboard and automated dark/light accessibility.
- Optional hosted integration: NOT RUN without real project environment. Script fails clearly when configuration is missing. The SQL harness supplies an auth.uid claim fixture; it does not test GoTrue/JWT signatures/PostgREST/SMTP.

Fixed verification failures: Windows PostgreSQL launcher inherited pipe prevented test harness completion (now detached stdio); production preview needed `/datum/` base; old test status selector became ambiguous with new save announcements. Added visible heading precondition to accessibility tests to avoid an empty-page false positive. Proactively tested real PostgreSQL timestamp offsets and account-switch owner guards.

## Environment / acceptance

Guest mode needs none. Cloud setup: follow exact migration, OTP email template, public variables and integration instructions in DATABASE.md. GitHub Pages public configuration is described in DEPLOYMENT.md. Manual acceptance checklist is in TESTING.md. Private provider/service-role credentials never enter the frontend.

## Known limits and milestone status

Local implementation and guest/database verification are complete; hosted Milestone 2.1 verification is pending external Supabase configuration. No live cloud-auth success is claimed. SMTP restrictions must be tested with real addresses. Self-service deletion remains a documented server workflow design. Internal navigation can discard unsaved edits, so visible Save guidance is provided; refresh/close warns. No full screen-reader/Safari audit. Dashboard remains clearly demo until 2.5.

Deployment: release is configured for the existing Pages site. Confirm actual workflow result and live guest smoke check before calling the publication successful; this report does not equate queued CI with deployed status.

No Milestone 2.2+ feature has been implemented. Stop here pending instruction.

CI portability follow-up: the first Linux release run stopped at PostgreSQL startup before deployment. The isolated harness now explicitly places its Unix socket in its own temporary directory and includes the server log in startup failures; Windows keeps its existing behavior. Release must pass this gate before publication.
