# GitHub Pages deployment

Repository: https://github.com/Shadabur-Rahaman/datum

Site: https://shadabur-rahaman.github.io/datum/

Preserved: Vite base `/datum/`, HashRouter for Pages builds, BrowserRouter for ordinary/local builds. Example: `/datum/#/learn/observations`. OTP code entry avoids auth-token hash collisions.

`.github/workflows/pages.yml` now gates deployment on unit tests, isolated PostgreSQL ownership tests and production-mode Playwright desktop/mobile/accessibility checks. It installs Chromium and OS dependencies, then builds again with public deployment configuration and uploads dist. Main pushes deploy through official Pages actions. No provider or service-role secret enters this workflow.

## Enable cloud accounts

Complete DATABASE.md first. In GitHub Settings → Secrets and variables → Actions → Variables, set:

- VITE_SUPABASE_URL: actual Project URL.
- VITE_SUPABASE_PUBLISHABLE_KEY: actual publishable key, never a secret/service-role key.

Rerun the Pages workflow after changes. Values are embedded at build time. With both absent the published app remains honestly guest-only. Browser CI uses an unconfigured guest build; run the real Supabase test suite and email acceptance checklist before enabling cloud accounts. No remote migration is automatically performed during deployment.

Build: `npm run build:pages`; output: dist; Node 24. Local production preview: `npm run preview -- --base=/datum/`. The ordinary Cloudflare-compatible build remains `npm run build`, with public/_redirects retained; hosting has not changed.

After publication verify actual workflow success, HTTP 200, dashboard and nested-route refresh, guest save recovery, and Settings configuration state. With cloud enabled also verify actual OTP email, cross-device recovery and two-user isolation. A queued workflow is not a successful deployment.


## V2.2 activation and password redirects

1. Apply migrations 005–009 after 001–004 and seed in the intended Supabase project; deploy mentor and delete-account with authenticated JWT verification.
2. Configure Auth Site URL to https://shadabur-rahaman.github.io/datum/ and add https://shadabur-rahaman.github.io/datum/#/settings to allowed redirects. Configure email confirmation as desired and an email delivery service. Password signup and reset use PKCE; open verification/reset links in the same browser that requested them. The code query parameter is consumed by Supabase; the hash remains the app route. After a recovery link establishes a session, use Set a new password in Settings. OTP entry remains available without URL tokens.
3. Configure Edge secrets SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY using the project's server-only configuration. Set ALLOWED_ORIGINS to the deployed origin if required by the existing CORS helper. Set AI_PROVIDER, AI_MODEL, AI_API_KEY using an actually available Gemini or Groq model. Optional GROQ_FALLBACK_KEY and GROQ_FALLBACK_MODEL enable one fallback after a primary Gemini failure, charging a second quota unit.
4. Verify signup, confirmation, login, reset, logout, deletion, two-user isolation, autosave while offline then online, stale-tab conflicts, import into a nonempty cloud notebook and cross-device resume in a disposable test project. Verify a real traceback receives useful provider guidance and that revoked provider credentials give the authored fallback.
5. Set only VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY as repository Actions variables and rerun Pages. Keep all private credentials out of VITE variables, repository files and client bundles.
6. Verify build-info.json equals the published workflow SHA; run EXPECTED_COMMIT=<sha> node scripts/smoke-live.mjs with normal platform environment syntax.

References checked: https://supabase.com/docs/guides/auth/passwords , https://supabase.com/docs/guides/auth/sessions/pkce-flow , https://supabase.com/docs/guides/auth/redirect-urls . No hosted activation is claimed until these steps are actually exercised.
