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
