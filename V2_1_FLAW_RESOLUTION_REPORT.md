# V2.1 flaw resolution report

Audit baseline: 81534880267a31e66ca82ceeddd7fef6681d1904. Full prior behavior/root causes/acceptance criteria are in V2_1_AUDIT.md. This report retains every issue ID and distinguishes working local systems from blocked external activation.

| Issue | Priority | Previous behavior / root cause | Changes and regression evidence | Final status |
|---|---|---|---|---|
| DEP-01 | P1 | Reported Phase 1 deployment mismatch | Exact baseline local/remote/deployed SHA already matched; diagnosis records run and assets. New release adds build-info.json. | ALREADY RESOLVED |
| DASH-01 | P1 | Hardcoded demo counts and activity | useJourney + Dashboard derive saved records; zero-state route checks and journey persistence. No page-view mastery. | FIXED |
| LEARN-01 | P1 | Static explanation/reflection only | Reusable LessonExperiment adds the complete hypothesis lesson loop. Browser checks cover prediction, misconception feedback and saved reflection. Eleven original lessons remain previews, as permitted by progressive expansion. | FIXED for flagship; remaining lesson expansion DEFERRED |
| SEARCH-01 | P2 | Concepts searchable, explicit tags absent | Twelve ID-matched keyword/skill lists join content search; existing search regression retained. | FIXED |
| DATA-01 | P1 | Six-row fixture | Seeded 1,000-row generator, immutable pipeline, actual summaries, linked chart/CSV/Python rows. Six engine tests plus desktop/mobile transformation checks. | FIXED |
| EXP-01 | P1 | No executable investigation loop | Guarded stages, required hypothesis/prediction, calculated before/after, explanation and notebook capture. Pure transition tests and persisted experiment browser flow. | FIXED |
| SAVE-01 | P1 | Internal navigation lost dirty drafts | Owner-scoped recovery memory, current-lesson pointer, versioned documents and CAS writes. Hook recovery/conflict/account tests plus refresh/navigation browser tests. Cloud activation tracked separately below. | FIXED locally |
| PY-01 | P1 | Textarea only / no execution | Lazy Monaco and real worker, six two-case exercises, errors, timeout/recovery and package loading. Actual browser Python tests run against the pinned CDN, not a mock. | FIXED |
| QUIZ-01 | P1 | Placeholder / no grader | Twelve questions, private SQL key lookup, idempotent request IDs, server feedback and stable option mapping. SQL correct/partial/invalid/duplicate/owner checks; guest resume browser checks. Hosted grading cannot be exercised without project configuration. | BLOCKED for live grading; local implementation verified |
| AI-01 | P1 | Authored hints only | Server gateway for tutor/debugger/reviewer; validated requests/replies, quotas/timeouts, explicit authored fallback. Unit and Edge-boundary tests use mocked provider HTTP, not real model replies. | BLOCKED by provider/project configuration |
| AUTH-01 | P1 | OTP/session code unconfigured | Existing foundation preserved; no project/email credentials available. No claim that OTP delivery or real JWT-backed accounts worked. | BLOCKED |
| DB-01 | P1 | Only foundation migrations | Additive migrations 002–004; actual PostgreSQL ownership, revision, grading, quota and cascade checks. Hosted migration/application is not performed. | BLOCKED for hosted rollout; local checks pass |
| SKILL-01 | P1 | Placeholder | Recent verified objective results/mistakes, practice counts and notebook evidence separately displayed. Route/accessibility checks; grading fixtures supply verified evidence shape. | FIXED locally; cloud evidence depends on AUTH-01 |
| NOTE-01 | P1 | Placeholder | Dataset/version/seed/config/code/finding/limits/reflection stored, edited, exported and reopened; desktop/mobile capture and reload checks. | FIXED |
| SETTINGS-01 | P2 | Deletion design only | Explicit typed confirmation and authenticated deletion function bind identity to verified caller. Mocked boundary checks reject missing auth and owner injection; SQL deletion cascade tested. Actual hosted deletion unavailable. | BLOCKED for hosted activation |
| UX-01 | P2 | Existing shell-only checks | Extended desktop/mobile journeys, real worker, accessible controls and chart labels; dark/light axe gates preserved and expanded. Human screen-reader validation remains outstanding. | FIXED for automated scope; manual audit DEFERRED |
| SEC-01 | P1 | Worker/gateway/grading boundaries absent | No browser score writes; server grader/quota ownership tests; Edge auth/input/provider validation; private recovery cleared on sign-out. Dependency audit zero vulnerabilities after DOMPurify override. Hosted penetration/acceptance checks require deployment. | FIXED for tested local boundaries; hosted validation BLOCKED |
| CI-01 | P2 | Only prior journey coverage | CI now type-checks/tests Edge handlers and exercises actual Python plus new journeys. All migrations are included in the database harness. | FIXED locally; publication verification described below |

## Earlier audit issues retained

V2_AUDIT.md items 1–3 (dashboard title, concept search, table/chart scope) were already resolved by the prior release; regressions remain covered. Item 4 (compressed pages/App settings extraction) was resolved previously and new source is formatted. Item 5 (browser CI) was already resolved and expanded here. Item 6 (stale phase documentation) is addressed by this dated release report and current README; older phase reports are historical, not current feature claims.

## Verification record

Final local verification on 2026-11-03:

- Clean `npm ci`: passed; dependency audit: zero vulnerabilities.
- `npm run build`: passed. Monaco remains a deliberately lazy large chunk.
- `npm test`: 40 passed across six files.
- `npm run test:db`: 35 real PostgreSQL checks passed, including independently authored quiz-answer fixtures, ownership denial, idempotency, daily/global quotas and cascade deletion.
- `deno check` for both functions: passed. `deno test --allow-env supabase/functions/boundaries_test.ts`: one suite passed (mocked Auth/provider/admin network boundaries, not hosted services).
- `npm run test:e2e`: 50 passed on desktop/mobile, including all six actual Python solutions, pandas/NumPy, traceback, timeout recovery, Monaco loading, evidence export/reopen, guest quiz resume, navigation recovery, keyboard and axe checks.
- Preserved old workspace regression coverage at `/investigate/legacy`.

Publication gate: existing Pages workflow must pass for the release commit, then `scripts/smoke-live.mjs` verifies the deployed `build-info.json` against EXPECTED_COMMIT and runs real guest Python/transformation/save/reload/quiz recovery on the public site. The final chat records the resulting SHA/run. `test-results/live-smoke.json` is the local verification artifact; it is generated after publication, not a substitute for CI. Hosted grading/Auth/AI remain explicitly blocked regardless of static publication success.

## Remaining external actions

See V2_1_RELEASE.md for exact project, migration, email, public variable and server-only provider configuration steps. No external secret has been embedded in the frontend. The currently usable guest path must not be described as a fully activated cloud/AI product.
