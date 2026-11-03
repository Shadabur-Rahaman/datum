# DATUM V2 audit — 2026-11-03

Baseline: commit 76a586f. Inspected all source routes, schemas, shared UI, tests, workflow and existing architecture/product/database/AI/content/testing/deployment/phase documentation. Existing application preserved.

## Confirmed working

React/TypeScript/Vite shell; dark/light appearance; sidebar/mobile navigation; twelve versioned lesson previews; authored guidance; six-row searchable/downloadable fixture; chart and editable draft views; error/empty states; hash routing and `/datum/` production base. Demo metrics are labeled. No claim that existing previews provide grading or AI.

## Confirmed bugs and debt

1. Dashboard document title resolves to Workspace while the heading/navigation call it Dashboard.
2. Curriculum search only indexes chapter/lesson titles, omitting descriptions, question text, concepts and prompts.
3. Table filters rows while chart and CSV use all rows without communicating scope.
4. Most page components and stylesheet rules are compressed into long single lines; Settings and all route composition live in App.
5. Pages workflow runs unit tests but omits browser regression/accessibility checks.
6. Previous phase documentation is historical and sometimes incorrectly implies the now-published app is local-only.

## Incomplete systems

No Auth client, profiles, migrations, RLS, draft persistence, lesson progress or mission-session storage. No attempts schema, guest migration or account export/deletion design. Python, living datasets, grading, AI and mastery remain later milestones. Page visits and demo statistics are not learning evidence.

## Security / accessibility

No embedded provider credentials found in tracked source; .env files are ignored. Authentication will require owner-scoped RLS plus server-only grading fields, bounded validated inputs and concurrency controls. Local guest storage is device-specific, readable by same-origin code and unsuitable for sensitive data. Supabase sessions must be isolated from guest drafts and cleared from the interface on sign-out/account change.

Baseline automated WCAG checks pass, including focus/skip navigation and mobile scrolling. Manual screen-reader and non-Chromium checks have not been performed. New Auth/persistence loading, conflict and failure states need labeled controls and announced status.

## Data model and priorities

P0: profiles, versioned content references, owned drafts, lesson reflection progress, mission sessions, server-owned quiz/practice attempts, private grading storage. Profile trigger, foreign keys, timestamps, indexes, RLS on exposed tables, revision-checked writes and retry idempotency. Never accept learner-authored verified results.

P1: email OTP sign-in, explicit saves/restoration, explicit non-overwriting guest import, export and deletion design, state reset on account changes, tests with two independent database identities.

P1: fix title/search/filter linkage; extract Settings and persistence services; gate Pages deployment on browser and database tests. P2: later milestones per V2_PLAN.md.

## Baseline results

- `npm run build:pages`: PASS.
- `npm test`: 16/16 PASS.
- `npm run test:e2e`: 20/20 PASS (desktop/mobile, dark/light automated accessibility).
- No Supabase project variables or credentials configured. Docker engine unavailable. PostgreSQL 18 installed; use an isolated test cluster without touching existing databases. Real hosted email/Auth roundtrip must be reported separately from local SQL ownership checks.
