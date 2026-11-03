# Current V2.1 database additions

Migrations 002–004 preserve the foundation schema and add owner-readable learning documents, private quiz grading, feedback and mentor budgets. `save_learning_document` uses authenticated owner checks, top-level JSON allowlists/size bounds, advisory locking and revision checks. Document contents are learner-authored and never establish verified scores. Import now supports up to 30 documents / 700 KB; each new document is bounded to 600 KB. Export schema version 2 includes learning documents. Original lesson/mission drafts remain unchanged.

Only `grade_delivery_quiz` writes verified quiz results. Keys are inaccessible through ordinary APIs; because this repository is public, do not use this educational bank as a secret high-stakes examination. Mentor budgets are service-role-only. Deletion is implemented in `supabase/functions/delete-account`, verifies Auth identity and cascades owned rows. It is not live until deployed and tested on a disposable account. See [V2_1_RELEASE.md](V2_1_RELEASE.md) for exact activation steps and limits.

## Foundation documentation (historical)

# Database — Milestone 2.1

Implemented migration: `supabase/migrations/202611030001_foundation.sql`. Idempotent catalog: `supabase/seed.sql`. No hosted project has been configured or migrated by this task.

| Entity | Purpose / authority |
| --- | --- |
| profiles | Auth trigger creates one record per user; owner can read and update display_name only. |
| content_items | Versioned, published lesson/mission references; published-only public reads, no browser writes. |
| user_drafts | Owned reflection or mission hypothesis/code/filter/view, with server revision and timestamps. |
| user_lesson_progress | Explicit draft_saved/reflection_saved, never verified completion or mastery. |
| user_mission_runs | Resumable session; saving remains BRIEF. Guarded mission progression belongs to 2.2+. |
| quiz_attempts / practice_attempts | Future server-written attempts. Owner reads only; no browser inserts/updates/deletes or verified_score changes. No grader exists yet. |
| private.assessment_keys | Empty until 2.3; no anon/authenticated schema/table privileges. |

All exposed tables have RLS. UUID owners reference auth.users with cascading deletion. Content references include versions and type integrity. Attempt parent references include owner so records cannot attach to another user's run. Owner/update-time indexes support reads. Private keys are outside public API access.

## Write contracts

`save_draft(p_content_id,p_version,p_body,p_expected_revision,p_owner)` is a bounded SECURITY DEFINER function with an empty search_path. auth.uid() is the authority; p_owner is only an account-switch guard and must match it. Validate allowed JSON keys/types/lengths and published content. A per-owner/content transaction lock protects inserts and updates. Identical retries return the existing row; stale changed writes return SQLSTATE 40001. Clients cannot set identity, revision, timestamps, completion or grades.

`import_guest_drafts(p_drafts,p_owner)` accepts at most 30 records / 300 KB atomically. Existing conflicting cloud drafts are kept; repeated imports are safe. The UI retains the local backup. Invalid records roll back the batch. `export_my_data()` returns all owned profile/draft/progress/session/attempt records in a versioned JSON envelope. For future large histories use a streaming export job.

## Exact setup

1. Create a Supabase project you control. From this checkout:

```sh
npx supabase login
npx supabase link --project-ref YOUR_ACTUAL_PROJECT_REF
npx supabase db push --include-seed
```

Use your real project reference; the text above is a placeholder, not invented configuration. Review the linked target before pushing. The migration runs once; seed is repeatable. Optional full local Supabase requires Docker: `npx supabase start`, then `npx supabase db reset` only against that disposable local stack. The standalone SQL suite does not need Docker.

2. Enable Email Auth and signup. Set Site URL to `https://shadabur-rahaman.github.io/datum/`; allow exact local URLs if needed. The UI uses code entry rather than redirect links to preserve hash routing.
3. Change the Magic Link/OTP template to `supabase/templates/otp.html`, including `{{ .Token }}`. If signup settings use a separate confirmation template, include the code there too. Link-only emails are not this UI's implemented flow. Configure SMTP or authorized test addresses; free-tier delivery limits/restrictions may apply. Errors are shown, not replaced with fake success.
4. Copy `.env.example` to `.env.local`. Set the actual Project URL and **publishable** key; restart Vite. For Pages set the same public GitHub repository variables and redeploy, per DEPLOYMENT.md. Never put a secret/service-role key into Vite variables.
5. Run the configured integration suite and manual email/two-user acceptance checks before treating cloud accounts as verified.

## Verification boundaries

`npm run test:db` creates a new isolated real PostgreSQL cluster on a free loopback port, applies the actual migration and seed twice, creates two independent auth.users records and role-switched sessions, and verifies grants/RLS/RPCs. It never connects to or resets an existing database. Set PG_BIN to PostgreSQL's bin directory if autodetection fails. Its minimal auth.uid claim fixture does NOT test GoTrue, JWT signatures, PostgREST or email delivery.

`npm run test:supabase` requires SUPABASE_TEST_URL, SUPABASE_TEST_PUBLISHABLE_KEY and SUPABASE_TEST_SERVICE_ROLE_KEY in the shell, for a disposable migrated TEST project only. It creates two unique users, generates OTPs through the admin API, verifies them through real Supabase Auth, tests PostgREST persistence/session restoration/ownership/import/export and deletes only its created users in finally. It never prints tokens or keys. Missing configuration exits 2, not a pass. Real email delivery still requires manual checking because this suite obtains codes via the admin API.

## Export, deletion and retention design

Settings exports guest JSON and signed-in owner-scoped cloud JSON. Clear guest drafts affects only DATUM guest keys. Cloud records are not copied to guest storage at sign-out. Browser storage is device-specific and readable by same-origin code; avoid sensitive data. Auth sessions are persisted by the Supabase SDK.

Self-service deletion is not enabled or represented by a pretend button. Operator procedure: require a fresh authenticated request, verify the immutable Auth UUID, offer export, confirm permanent deletion, then use Auth Admin deleteUser from a trusted server/admin environment for that UUID. Never trust an arbitrary unauthenticated UUID/email. Verify cascades and revoke sessions; do not log tokens or exported content. All owned rows cascade; there is no Storage bucket in 2.1. Future Storage objects must be removed before Auth deletion. Backups retain deleted data until the operator's configured expiry, which must be disclosed; no fixed retention period is claimed. Future self-service requires a recently reauthenticated, owner-checked, idempotent Edge Function.

Official references: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [templates](https://supabase.com/docs/guides/auth/auth-email-templates), [testing](https://supabase.com/docs/guides/local-development/testing/overview).


## V2.2 additive migrations

Apply 202611030005 through 202611030009 in lexical order after the existing four migrations and seed. 005 adds twelve lesson activity document IDs; 006 adds six versioned protected chapter assessments and grade_chapter_quiz; 007 permits chapter sessions, research history and mentor conversations; 008 expands atomic import and merges notebook entries by ID, cloud copy winning; 009 adds authenticated my_mentor_usage. Existing tables and owner foreign keys remain in place. Direct client writes to protected attempt/score tables remain denied.

For chapter submission pass p_content_id (chapter-1-v22 through chapter-6-v22), p_request_id UUID, p_answers and p_owner. The RPC verifies auth.uid, enforces a shared 20/hour quiz limit, checks every response type/option and commits a server grade with feedback. Same request and payload is idempotent; modified payload under an existing request is rejected. Public metadata never contains grading answers.

Apply migrations with the authorized project's normal Supabase CLI or SQL editor workflow. Do not paste service-role keys into the frontend or this chat. Then run the configured test:supabase suite against a disposable test project and manually verify two distinct real accounts, reset email and a second browser/device before enabling production variables. Local PostgreSQL tests do not substitute for that acceptance.
