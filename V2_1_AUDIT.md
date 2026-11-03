# V2.1 full-system audit

Baseline commit: 8153488. Source, runtime tests, migrations, prior audit/plan/changelog and Pages workflow reviewed. The following IDs are retained in V2_1_FLAW_RESOLUTION_REPORT.md; none may disappear.

| ID / priority | System and classification | File / function; evidence and impact | Proposed repair; test and acceptance |
|---|---|---|---|
| DEP-01 P1 | Deployment mismatch: already resolved | Git/Actions show exact local=remote=deployed SHA; apparent Phase 1 UI reflects unfinished engines. | Diagnosis and release metadata; exact-SHA workflow and live route smoke check. |
| DASH-01 P1 | Dashboard: only visual | Dashboard.tsx hardcodes demo progress, activity and skills. No real learner overview. | Derive saved counts/next actions; empty guest starts at zero; never label saved drafts mastery. |
| LEARN-01 P1 | Curriculum: partial | 12 previews retained, Lesson.tsx contains explanation/reflection but no full experiment/check loop. | Upgrade flagship lesson with reusable objective/example/prediction/feedback/challenge; retain other previews honestly; full journey browser check. |
| SEARCH-01 P2 | Search: partial | Learn searches description/concept, but content has no explicit skill/keyword tags. | Structured tags and searchable keywords; relevant keyword regression. |
| DATA-01 P1 | Explorer: visual fixture | Investigate uses 6 authored rows; no seeded engine/sorting/summaries/transform pipeline. | Seeded 1,000-row generator and deterministic linked calculations; unit fixtures and reproducibility tests. |
| EXP-01 P1 | Investigation: partial | Persisted draft exists; no prediction/run/evidence state machine. | Pure guarded prediction→experiment→explanation state; tests reject out-of-order actions. |
| SAVE-01 P1 | Persistence: partial/defective | useDraft explicit saves; internal navigation can lose unsaved edits. Existing cloud RLS tested locally, hosted Auth not configured. | Protect edits and add versioned experiment/practice/notebook records; refresh/conflict tests; no account leakage. |
| PY-01 P1 | Python: missing | Textarea only, no execution. Practice is Upcoming. | Lazy Monaco + isolated Pyodide module worker; six two-fixture challenges; real stdout/errors/timeouts tested. |
| QUIZ-01 P1 | Quiz: missing | Upcoming UI and reserved attempts schema; no questions or grader. | Twelve private-key authored questions, server deterministic grader, stable IDs, idempotency and resume; SQL grading tests. Live grading requires configured backend. |
| AI-01 P1 | Mentor: authored hint only | No gateway/provider. | Authenticated bounded Edge Function, role-specific validated output, quota/timeout/fallback; no invented model output. Live provider blocked by secrets/project. |
| AUTH-01 P1 | Auth: implemented, externally unverified | Supabase OTP UI/session code, absent project variables. | Preserve; real-project OTP/SMTP and two-user API suite after configuration. No false live claim. |
| DB-01 P1 | DB: locally verified, externally unverified | Migration/RLS suite tests 31 operations with two identities; no hosted migration. | Add compatible migration, private graders/quotas/owned docs and allow/deny checks; hosted apply remains external. |
| SKILL-01 P1 | Skill DNA: missing | Upcoming only. | Transparent evidence counts, unverified practice separate from server grades; no page-visit mastery. |
| NOTE-01 P1 | Notebook: missing | Upcoming only. | Versioned source/experiment/code references, editable conclusions/limits/reflection, Markdown export and restoration. |
| SETTINGS-01 P2 | Settings: partial | Profile/export/guest controls work when configured; deletion design only. | Preserve, add authenticated deletion handler; no deployed deletion claim until configured. |
| UX-01 P2 | Mobile/accessibility: tested subset | Existing desktop/mobile dark/light axe and keyboard checks pass; no full assistive-tech audit. | Expand actual journey checks and chart alternatives; manual screen-reader limitation remains explicit. |
| SEC-01 P1 | Security: locally verified subset | Client cannot write scores; private schema denied; no worker/gateway yet. | Preserve owner guards; grade/quota privileges and worker limits tests. Browser checks remain untrusted practice. |
| CI-01 P2 | CI: implemented | Unit/SQL/production-browser gates already exist. | Expand to new journey plus real Python smoke; keep Pages base/hash routes. |

Previously reported title, search concepts, table/chart mismatch and absent browser CI were fixed in the previous release. Verify rather than reimplement. Current audit does not classify a UI component or test mock as a working remote service.
