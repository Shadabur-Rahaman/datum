# DATUM — Phase 0 + Phase 1

An original data science learning workspace built around investigation and evidence. This delivery is the application foundation, not the completed learning engine.

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

Open the URL printed by Vite. Production output is `dist/`. No environment variables or paid services are needed for Phase 1.

## What works

- Responsive navigation, all eight main destinations, not-found states, error boundary and keyboard skip link.
- Dark/light appearance stored locally, including a truthful storage failure message.
- Dashboard with explicitly illustrative progress, skills and activity.
- Searchable six-chapter track and twelve structured lesson previews with temporary reflections and authored thinking guides.
- Three-panel investigation layout, mobile panel switching, searchable six-row fixture, CSV download, accessible sample chart, editable/resettable Python draft, and authored offline hint.
- Settings and explicit upcoming states for unimplemented integrations.

## Scope and limitations

Only appearance is persisted. Drafts disappear on navigation or refresh. No login, database, verified progress, real Python execution, graded quizzes, AI provider or notebook storage exists yet. Lesson previews are not twelve completed interactive lessons. The six-row layout fixture is not the Phase 3 Living Dataset Engine. Sample dashboard metrics are not learner achievements. GitHub Pages deployment is configured through `.github/workflows/pages.yml`.

The next authorized phase would be Phase 2: Supabase schema, authentication, RLS and persistence. Stop here until instructed to continue.

See [ARCHITECTURE.md](ARCHITECTURE.md), [PRODUCT_SPEC.md](PRODUCT_SPEC.md), [TESTING.md](TESTING.md), and [PHASE_REPORT.md](PHASE_REPORT.md).

