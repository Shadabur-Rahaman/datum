# DATUM — current release 0.2.2

Interactive data-science investigations with a 1,000-row reproducible lab, actual browser Python, six practice challenges, saved evidence, twelve server-graded quiz definitions and an authenticated AI gateway.

The public deployment currently supports the guest learning path. Hosted accounts, quiz grading, AI and account deletion require the external configuration in [V2_1_RELEASE.md](V2_1_RELEASE.md). Eleven lessons remain guided previews. See [V2_1_FLAW_RESOLUTION_REPORT.md](V2_1_FLAW_RESOLUTION_REPORT.md) for verified results and limits.

## Prior foundation release notes (historical)

# DATUM — V2 Milestone 2.1

An original data science learning workspace built around investigation and evidence. This delivery adds saved-work foundations to the existing preview. It is not the complete V2 learning engine.

## Hosted preview

GitHub Pages: https://shadabur-rahaman.github.io/datum/ (deployment status is available in repository Actions). Repository: https://github.com/Shadabur-Rahaman/datum. Pushes to main run tests and publish the current preview. Hosted routes use hashes, for example `/datum/#/practice`, so refreshing works on static hosting.

## Run locally

Requires Node 22.12+ (tested with Node 24.13.1) and npm.

```sh
npm ci
npm run dev
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Open the URL printed by Vite. Production output is `dist/`. No environment variables are needed for guest mode. Cloud accounts require the real Supabase configuration and migrations in DATABASE.md.

## What works

- Preserved responsive dark/light research workspace, navigation, lesson previews and authored guidance.
- Explicit guest saves for lesson reflections and mission hypothesis/code/filter/view, with refresh recovery and stale-write detection.
- Supabase email OTP, profile, account draft restoration, explicit guest import and export code, ready for project configuration.
- SQL migrations with owner-only RLS, server-controlled attempts, revision-checked writes and idempotent imports.
- Fixed title, concept-aware curriculum search and linked table/chart/CSV filters.
- Deployment gated on unit, production browser and real PostgreSQL tests.

## Verification boundary

Guest behavior and local SQL ownership rules are tested. Hosted Supabase Auth, email delivery and cloud recovery are not yet verified because no project configuration was supplied. Settings honestly shows guest-only mode in that case. Dashboard metrics remain labeled examples, not learner achievements. Python, grading, AI, notebook/mastery and a living dataset remain later milestones.

See [V2_AUDIT.md](V2_AUDIT.md), [V2_PLAN.md](V2_PLAN.md), [V2_CHANGELOG.md](V2_CHANGELOG.md), [DATABASE.md](DATABASE.md), [TESTING.md](TESTING.md) and [DEPLOYMENT.md](DEPLOYMENT.md). Original PHASE_REPORT.md is a historical Phase 1 report.

Stop at Milestone 2.1. Next is Milestone 2.2 only after instruction.
