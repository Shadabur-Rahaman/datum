# V2.2 incremental implementation plan

1. Establish baseline and audit before source changes.
2. Add recoverable debounced autosave and compatible learning-document schema extensions; test failures, stale revisions and account boundaries.
3. Expand all twelve lessons using reusable computed demonstrations and persistent practice evidence; keep original curriculum and hypothesis lesson.
4. Add 36-question chapter assessment, separate unverified guest practice, review/retry/history/timer and protected SQL grading.
5. Add password authentication/reset, deterministic guest merge, mentor context/conversations/provider fallback and usage records. Hosted activation is separate from local checks.
6. Add experiment history/rubric, notebook retrieval tools and transparent recommendations/skill timeline.
7. Run new and preserved tests, document all unresolved items, publish through existing Pages workflow and verify exact build identity and live guest journey.

Compatibility: preserve original IDs and migrations, use additive migrations and optional fields/defaults. Keep guest practice evidence separate from verified assessment evidence. Preserve /datum/ hash routes and old saved workspace. Never embed provider or service-role secrets in client assets. Explicit conflict resolution is required rather than automatic stale overwrite.


## Execution outcome

Feasible source phases implemented, preserving original routes, worker, original assessment, lab engine and document IDs. New state uses additive document types and migrations 005–009. The new lesson/quiz/lab/mentor records are bounded, owner-scoped and labeled according to trust level. Local verification is recorded in V2_2_TEST_REPORT.md. External hosted activation remains BLOCKED; scale work explicitly DEFERRED in V2_2_LIMITATIONS.md. Release gates and publication evidence are in V2_2_RELEASE.md.
