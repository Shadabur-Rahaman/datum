# Architecture — version 1

## Phase 0 inspection

The provided workspace was empty: no existing source, repository metadata, package manifest, AGENTS.md or implementation conventions. Node 24.13.1 and npm 11.8.0 were available. This is a new local React application; GitHub creation and publication are deferred.

## Decisions

- React 19 + TypeScript + Vite 8; React Router 7 declarative routing. Tailwind 4 Vite integration, Lucide, and a shadcn-style owned Button using Radix Slot/CVA. Semantic HTML supplies simple controls; no unnecessary component framework.
- Versions resolved from npm and frozen by package-lock.json. See package.json for the resolved compatible ranges. Build and tests provide compatibility checks.
- Versioned Zod-validated data in `src/content/track.ts`; route pages render shared content rather than embedding twelve JSX lessons.
- Shared UI under `src/components/ui`, route features under `src/pages`, helpers under `src/lib`. CSS variables form the theme contract.
- Phase 1 uses only local React state plus theme localStorage. No fake service adapter, execution result, grading result or AI response.
- Future feature modules: auth/progress (Phase 2), datasets/missions (3), Python worker/practice (4), quiz (5), mentor client (6), evidence/mastery (7). Add heavy dependencies only in their implementing phase. Monaco and Pyodide must be lazy-loaded. Use Recharts for ordinary derived charts and Plotly only where scientific interaction warrants the bundle cost.

## Future trust boundaries

Browser → Supabase Auth/PostgREST with user JWT + RLS for owned data. Browser → authenticated Edge Functions for private grading and AI. Edge Functions → configurable Gemini/Groq providers. No service role or provider secrets in browser code. Worker execution is untrusted practice, never verified examination grading.

Mission state: BRIEF → HYPOTHESIS → EXPLORE → EXPERIMENT → EXPLAIN → REFLECT → COMPLETE. Implement pure transition guards in Phase 3; require evidence actions and rubric criteria, not button clicks. Repeated submit operations use idempotency keys. Data transformations retain source version, seed, filter parameters and computed facts.

## Original design system

Charcoal/slate surfaces, mint-teal actions, blue-compatible chart accents and restrained violet mission accents. Light theme uses off-white surfaces and deeper teal for contrast. System sans typography avoids external font dependence; monospace is reserved for code and identifiers. Rounded 7–11px surfaces, 1px borders, 8px spacing rhythm, restrained gradients, visible focus and reduced-motion support. Primary action: continue the investigation. Secondary actions: explore or inspect. Demo labels remain visible near illustrative data.

Desktop sidebar: 232px; narrower desktop: 210px. Below 700px navigation expands in document flow (not a modal needing a focus trap). Below 950px the investigation panels become explicit selectable views. Tables scroll inside their own container. All charts include values or tabular alternatives. Route changes focus the main landmark.

## Official sources checked, 2026-11-03

- https://vite.dev/guide/ — React/TypeScript template and supported Node baseline.
- https://ui.shadcn.com/docs/installation/vite — Vite/Tailwind integration and owned UI components.
- https://reactrouter.com/start/declarative/installation — client-side declarative routing.
- https://vitest.dev/guide/ — Vite-compatible tests.
- https://tailwindcss.com/docs/installation/using-vite — Tailwind Vite plugin.

Review Supabase, Pyodide, Monaco, Gemini and deployment provider documentation again immediately before implementing those phases; do not freeze future API assumptions now.
