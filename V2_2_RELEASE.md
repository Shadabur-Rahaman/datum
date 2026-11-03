# DATUM V2.2 release

Product V2.2, package 0.3.0. Previous production commit: eab2646b266d63b1bd86ca7f8f4cd62dd39bf6e6.

Publication status: VERIFIED on 4 November 2026 (Asia/Calcutta).

- Published application commit: `aeb7b6308101adb4ad04a0f4dc366b47db525567`.
- Successful workflow: https://github.com/Shadabur-Rahaman/datum/actions/runs/41708702926 . GitHub ran the unit, real PostgreSQL, Edge boundary and full production browser gates before publishing.
- Public build-info.json reports that exact commit, package `0.3.0`, built at `2026-11-03T20:03:50.025Z`.
- Live isolated-browser smoke: nine routes; real Pyodide execution and two practice checks; transformed lab restored; original quiz answers restored; new lesson computed 24 cells, passed its checks and restored practice evidence; separate guest chapter practice graded correctly and restored history. Zero browser errors.
- Local results: 67 unit tests, 40 database checks, 80 full browser tests, 1 multi-assertion Edge boundary suite. Additional focused layout/lesson rerun: 60 passed. No final failures or skipped local tests.

This release-evidence follow-up changes documentation and the separately executed live smoke script only. It does not change the application artifact; the verified deployed application commit remains the one above. Its commit skips redundant CI/deployment so documentation does not replace the already verified runtime artifact.

BLOCKED: hosted Supabase/Auth/email, cross-device real-account acceptance and actual AI provider acceptance. These are not claimed as passed. Exact setup is documented in DEPLOYMENT.md and DATABASE.md; bounded/deferred features are listed in V2_2_LIMITATIONS.md.

Authorized destination: https://shadabur-rahaman.github.io/datum/#/ through the existing main-branch Pages workflow. No force push. Database migrations are additive and are not silently applied to a remote project.

Deploy checklist: preserve prior guest data, run unit/SQL/Edge/browser gates, verify build identity and published routes, real Python and guest persistence. Cloud activation remains BLOCKED until configured and tested. No stakeholder messaging is authorized or sent.

Rollback: if a published guest flow fails or a new critical data-loss/security issue is found, revert the V2.2 release commit with a new normal commit, run gates and redeploy. Keep exported drafts. Do not roll back by deleting learning tables or forcing Git history. New document IDs remain separate from original V2.1 drafts; earlier releases ignore them.
