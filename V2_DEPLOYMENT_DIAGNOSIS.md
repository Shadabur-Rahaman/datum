# Deployment reconciliation — 2026-11-03

Inspection before edits: correct checkout `D:/9_Data_Science_Engine`, clean main branch, remote `https://github.com/Shadabur-Rahaman/datum.git`. No divergent or additional branches. Fetch completed; diff against origin/main empty. No history rewriting or work deletion.

- Local HEAD: `81534880267a31e66ca82ceeddd7fef6681d1904`
- Fetched origin/main: `81534880267a31e66ca82ceeddd7fef6681d1904`
- Successful deployed commit: `81534880267a31e66ca82ceeddd7fef6681d1904`
- [Verified deployment run](https://github.com/Shadabur-Rahaman/datum/actions/runs/41602380581): completed/success.
- Production HTML references `/datum/assets/index-Bfsr5njg.js` and `index-CScRzOcn.css`, fetched with cache bypass. Earlier live smoke test verified guest persistence and Settings disclosure from this release.

The premise that only the original commit is currently published is not reproducible. Three commits exist: Phase 1, V2 persistence, Linux CI repair. No evidence of current authentication/push/branch/base-path/runtime failure. A prior intermediate CI failure was repaired; the later deployment passed. Public API list responses previously returned an older cached run; querying by exact head SHA resolves the ambiguity. This does not prove the independent observer's browser cache was stale.

Confirmed product explanation: Dashboard deliberately retained demo metrics and Phase 1 composition; Python/quiz/AI/skills/notebook were still placeholders. V2.1 persistence did not implement those later engines. Supabase variables are absent, so production is intentionally guest-only. Those missing systems are implementation/configuration gaps, not missing commits.

Baseline installation encountered a locked native CSS dependency from project-owned preview servers. Those servers were stopped without changing source; npm ci was retried. Record subsequent release SHA/status in the flaw report only after actual verification.
