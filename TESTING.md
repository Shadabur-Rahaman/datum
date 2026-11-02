# Testing

`npm test` runs Vitest + React Testing Library. Route tests cover every main destination, missing route/lesson, curriculum search/no-results recovery, dashboard-to-lesson navigation, reflection/hint interaction, code draft reset, theme persistence and content identity/count.

`npm run test:e2e` runs Playwright Chromium desktop and mobile. It checks routing, theme reload, keyboard skip navigation, mobile menu, workspace panels, table search, chart/code views, horizontal overflow and automated WCAG A/AA checks on dashboard, learning overview, investigation and settings. Install browser with `npx playwright install chromium` if unavailable. The config starts Vite automatically. A passing automated accessibility scan does not replace a full screen-reader audit.

Manual verification:
1. Start Vite and open `/`. Confirm all dashboard statistics say demo/example.
2. Use Continue learning; enter a reflection and reveal/hide the authored guide. No grade or completion is recorded.
3. Open Learn, search a nonsense term, clear it, then open a lesson.
4. Open Investigate. Search DL-1002, download CSV, switch Chart/Python, edit and reset code. Confirm output says no execution.
5. At 390px width, open the navigation and use Brief/Workspace/Mentor buttons. Test Tab, Shift+Tab, Enter and Escape; use the skip link.
6. Change theme in Settings; reload. Test unknown URL and unknown lesson. Disable browser storage to see the preference warning.
7. Inspect Practice, Quiz Arena, Skill DNA and Notebook: each explains its future phase without fake success.

Future phase suites: pure mission guards, deterministic transformations and numerical calculations (3); worker execution and timeout (4); private server grading (5); gateway auth/schema/outage (6); mastery/evidence (7); comprehensive auth, isolation and deployment validation (8). These are not runnable claims in Phase 1.
