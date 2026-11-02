# Deployment

GitHub Pages is configured for `Shadabur-Rahaman/datum`. The workflow tests and builds with `npm run build:pages`, uploads dist, and deploys to https://shadabur-rahaman.github.io/datum/. Pages mode uses HashRouter and base `/datum/`; local and ordinary builds retain BrowserRouter. No secrets are required. Check the Actions deployment result for publication status. Cloudflare remains an alternative below.

For Cloudflare Pages: use Node 24, `npm ci` to install, `npm run build` as build command and `dist` as output directory. `public/_redirects` provides SPA route fallback for deep links. No frontend variables are required in this phase.

Phase 2 setup: create a Supabase project, apply reviewed migrations and idempotent seeds using Supabase CLI, run RLS tests against two users, configure email auth and exact local/production redirect URLs, then set public URL and publishable key as documented in .env.example. Do not use service-role credentials in the client. Actual migration commands await migration files in Phase 2.

Phase 6: deploy authenticated Edge Functions, set provider keys/models through Supabase secrets, verify JWT/ownership enforcement and provider failure behavior. Consult current official SDK/API docs at implementation time.

Before deployment: connect authorized GitHub repository; pass build, unit and browser checks; review exposed bundle for credentials; verify environment and security headers appropriate to required worker/CDN resources; verify deep links, keyboard access, mobile layout and theme. Later add cross-user isolation, real code execution timeout, private quiz grading, AI outage fallback, export/deletion and guest migration smoke tests. A free-tier limit must produce an honest recoverable state. Do not claim a live app without a verified URL.

