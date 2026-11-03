# DATUM V2.2 audit — 2026-11-03

Before implementation: clean main at eab2646b266d63b1bd86ca7f8f4cd62dd39bf6e6, tracking origin/main. Production build-info.json reports exactly the same SHA and package 0.2.2. No AGENTS.md is tracked. Existing source, four migrations, Edge handlers, worker, six challenges and prior release/resolution reports inspected. Baseline tests are running; results will be recorded in V2_2_TEST_REPORT.md rather than presumed from previous counts.

| ID | Finding and affected system | Priority | Required change / acceptance |
|---|---|---|---|
| AUTH22 | AccountPanel supports email OTP only; password/signup/reset absent. Cloud project remains unconfigured. | P1 | Add password flows and hash-safe reset; unit boundary checks; hosted acceptance BLOCKED until configured. |
| SAVE22 | useDraft has explicit save plus memory recovery; closing before save loses unsaved work. | P1 | Debounced save with persistent, owner-scoped recovery, stale-write protection and offline retry. Navigation/refresh/concurrent edit tests. |
| MERGE22 | Import retains conflicting whole documents; compatible notebook entries are not merged. | P1 | Merge by stable entry ID, preserve cloud conflicts, atomic/idempotent SQL tests. |
| QUIZ22 | Twelve protected assessment items; no guest grading, practice/history/retry/timer. | P1 | 36 assessment items across six chapters, distinct public practice bank, deterministic grading and server-key isolation tests. |
| LESSON22 | Eleven lessons are previews; hypothesis interaction exists but evidence is a reflection only. | P1 | Twelve meaningful, computed interactive activities and persisted practice evidence. Each lesson has objective, analogy, worked example, prediction, result, applied check and reflection. |
| AI22 | Three gateway roles; manual context only; no Python traceback handoff, navigator, conversation storage or fallback provider. | P1 | Bounded selected context, four roles, authenticated persistence/quota statistics, explicit fallback and provider-failure tests. Real provider acceptance BLOCKED without secrets. |
| LAB22 | Deterministic 1,000 rows and linked pipeline work; no undo/history or objective rubric. | P2 | Versioned snapshots, reversible history, selected Python views and calculated evidence checks. Preserve dataset v1 and old drafts. |
| SKILL22 | Basic counts and recent quiz feedback; no rules/graph/recommendation/timeline. | P1 | Transparent evidence rules, recent objective performance, independent recommendations and explanation of every status. |
| NOTE22 | Functional 30-entry document; no search/filter/pagination or chart specification. | P2 | Search, filtering, pagination and source/chart metadata; retain bounded cap until sustainable server entry storage is proven. |
| QA22 | Existing unit/SQL/browser/Edge suites and CI; new features need new acceptance coverage. | P1 | Preserve regressions, add targeted tests and verify published SHA plus live guest behavior. |
| HOST22 | No configured Supabase project/provider. | P1 | Complete feasible implementation, document activation; never label mocks or local SQL as hosted verification. |

The repository remains the existing checkout. Restricted tool access required an approved escalation for Git inspection/tests. No reset, forced push or branch deletion was performed.


## Resolution status after implementation

- VERIFIED: original baseline 40 unit / 35 database / 50 browser checks rerun before edits; deployed eab2646 identity confirmed.
- FIXED: AUTH22 password account UI/PKCE integration. Hosted email acceptance BLOCKED.
- FIXED: SAVE22 durable debounced recovery, in-flight edits and stale revision handling.
- FIXED: MERGE22 new document import and notebook UUID union, cloud conflict copy retained; atomic capacity rejection.
- FIXED: QUIZ22 36 protected chapter questions, independent public practice, timer/history/retry. Local SQL trusted grading VERIFIED; hosted grading BLOCKED.
- VERIFIED: LESSON22 all twelve computed activities tested on desktop/mobile, meaningful checks required for practice evidence.
- FIXED: AI22 four roles, actual Python context, bounded saved conversation, quota statistics and optional charged fallback. Real-provider acceptance BLOCKED.
- FIXED: LAB22 undo, templates, snapshots, selected Python dataset and objective rubric.
- FIXED: SKILL22 transparent distinct-objective rules, recommendations and timeline.
- FIXED: NOTE22 search/filter/pagination, partial-edit recovery and chart/mission references. Normalized unlimited storage DEFERRED.
- VERIFIED: QA22 expanded local automated checks; see V2_2_TEST_REPORT.md for exact totals.
- BLOCKED: HOST22 external cloud activation; Pages guest release verified separately in V2_2_RELEASE.md.

- VERIFIED: Pages publication aeb7b6308101adb4ad04a0f4dc366b47db525567, workflow 41708702926, live guest smoke with zero browser errors. External HOST22 cloud/provider acceptance remains BLOCKED.
