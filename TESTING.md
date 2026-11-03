# Verification — DATUM 2.1

Baseline: Pages build, 16 unit and 20 desktop/mobile checks passed. See V2_AUDIT.md. Final results are in V2_CHANGELOG.md.

```sh
npm ci
npm run build:pages
npm test
npm run test:db
npx playwright install chromium
npm run test:e2e
```

Unit tests cover existing routes, authored content, OTP UI/errors using explicit mocks, guest schemas/storage, retries, stale updates, unavailable/corrupt storage, real PostgreSQL timestamp formats, account changes and failed-save recovery. Mocked Auth does not establish real connectivity.

The database suite uses real isolated PostgreSQL, two identities and the shipped migration. See DATABASE.md for its explicit Auth boundary. Optional `npm run test:supabase` requires actual test-project configuration; absent values report not run. Never count an unavailable integration as passing.

Playwright now builds production Pages mode and serves `/datum/` on port 4175. It checks hash route refresh, desktop/mobile navigation, existing accessibility, guest save/recovery, code/session restoration, linked table/chart/CSV filter, concept search, dashboard title, unavailable storage and stale-tab conflicts. Accessibility tests first require a visible heading. Chromium mobile emulation is not Safari testing.

## Manual guest acceptance

1. Dashboard title says Dashboard · DATUM; all sample activity stays labeled demo.
2. Search Learn for `imputation`. Open a lesson, enter a reflection, Save draft, refresh and verify restoration. Page visits do not mark completion.
3. Investigate: enter hypothesis, filter DL-1002, inspect Chart (one record), edit Python (not executed), save and refresh. Hypothesis, code, filter and view restore.
4. At mobile width use Brief/Workspace/Mentor and Save draft below the panels. Verify keyboard skip link, focus rings, Escape and both themes.
5. Settings: export guest data. Open two tabs on one lesson. Save newer text in the second tab; a stale first-tab save must report a conflict without losing edits. Reload deliberately to discard edits.
6. Block browser storage: saving must report failure with text still present. Save before internal navigation; refresh/close has a before-unload warning for unsaved edits.

## Configured Supabase acceptance — not yet executed

1. Apply migration/seed, set real URL/publishable key and OTP email template as in DATABASE.md.
2. Request and verify an emailed code for user A; edit profile, save lesson and mission work. Sign out/in and recover. Repeat in a fresh browser profile to prove server persistence.
3. Sign in as B in another profile; confirm A's drafts/progress/export cannot be accessed through UI or direct PostgREST. Score/private-key writes must fail. Also run `npm run test:supabase` against a disposable project.
4. Save guest work, sign in and verify there is no automatic import. Explicit import adds missing work, preserves existing cloud versions, retains the local backup and tolerates retries.
5. Exercise offline save, expired OTP, rate limiting, revoked sessions and stale revisions. No false success. Switch accounts during a pending save: the server owner guard must reject an old-user payload.
6. Export account data; follow the documented operator deletion procedure for a disposable user and verify cascades.

Limits: no hosted project/SMTP verification yet, no full manual screen-reader audit or non-Chromium testing. Python/grading/AI suites belong to later milestones.
