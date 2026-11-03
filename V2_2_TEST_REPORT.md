# V2.2 test report

Baseline verified before edits: 40 unit tests, 35 isolated PostgreSQL checks, 50 desktop/mobile browser tests.

## Local results

- VERIFIED: `npm test`: 67 tests in 13 files; all passed, zero failed/skipped.
- VERIFIED: `npm run test:db`: 40 checks on isolated PostgreSQL with two independent authenticated identity sessions; all passed, zero failed/skipped.
- VERIFIED: `npm run test:e2e`: 80 tests (40 desktop, 40 mobile Chromium), all passed in 3.0 minutes; zero failed/skipped. Preserves the original 50 tests and adds 30.
- VERIFIED: Deno check for mentor and delete-account; boundary suite 1 passed, 0 failed, including auth, input limits, quotas, one bounded charged fallback, both-provider failure and owner-bound deletion.
- VERIFIED: production build runs TypeScript and Vite with `/datum/` base. Monaco remains a large lazy-loaded optional chunk; warning is not hidden.
- BLOCKED: hosted acceptance listed below. Publication evidence is tracked separately in V2_2_RELEASE.md.

## Twelve-lesson validation checklist

Every row passed desktop and mobile browser execution: prediction required, parameter changed, actual computed result displayed, knowledge and numerical checks accepted, explanation recorded, practice evidence saved and restored after refresh, no horizontal overflow. No page view grants mastery.

| Lesson | Computed interaction | Applied evidence |
|---|---|---|
| observations | row count × three fields | number of table cells |
| hypotheses | duration exclusion and recomputed mean; original hypothesis demo retained | changed mean and causal caveat |
| python-basics | variable arithmetic, explicitly a simulation | output value; link to real worker challenge |
| processing | strict threshold filter | retained count |
| dataframes | distance filter over actual seeded rows | retained row count |
| missing | configurable imputation | recomputed mean and missingness caveat |
| distributions | moving outlier and histogram bins | mean and bin counts |
| charts | configurable axis baseline | displayed bar-height gap versus unchanged measured difference |
| summary | outlier affects mean versus median | mean and robust center comparison |
| uncertainty | sliding sample over a fixed population | sample mean versus population mean |
| features | adjustable target leakage | computed apparent MAE and availability caveat |
| evaluation | coefficient changes held-out predictions | computed MAE and test-tuning caveat |

Coverage added: password signup/login/reset/update API contracts and errors; persistent recovery and in-flight editing; 12 computed lesson fixtures; 36 protected question metadata; public practice grading; distinct-objective mastery rules; research recipe/rubric limits; real SQL chapter grading/idempotency/isolation; new guest document imports; notebook UUID merge; owner-only AI usage; provider fallback charges and outage response; desktop/mobile interactions for every lesson, guest practice, autosave and research snapshots.

BLOCKED rather than passed: hosted email/Auth flows, cross-device account synchronization, hosted RLS integration and real Gemini/Groq responses. Browser tests intentionally run guest-only configuration. The optional real Supabase suite requires external project variables.

Intermediate failures repaired: JSX closing brace in lesson activity; unsupported Testing Library test option caused TypeScript to stop browser startup; rejection fixture expected permission-denied instead of invalid-input. No application failure was hidden by removing a test. A mobile screenshot review also found the pre-existing dashboard button/progress overlap; the footer now stays in normal layout flow.


## Published verification — 4 November 2026 (Asia/Calcutta)

VERIFIED: GitHub workflow 41708702926 completed successfully for aeb7b6308101adb4ad04a0f4dc366b47db525567. The live build identity matched exactly. `EXPECTED_COMMIT=aeb7b6308101adb4ad04a0f4dc366b47db525567 node scripts/smoke-live.mjs` passed nine routes, actual Python and two checks, transformed lab restoration, original quiz draft restoration, new lesson computation/check/save restoration, and public chapter practice grading/history restoration, with zero browser errors. The environment-variable spelling here is conceptual shell syntax; use `$env:EXPECTED_COMMIT` in PowerShell.

The final mobile layout fix passed a focused 60-test desktop/mobile shell and V2.2 lesson rerun. CI subsequently ran the full release suite successfully. External hosted checks remain BLOCKED, not skipped-and-counted-as-passing.
