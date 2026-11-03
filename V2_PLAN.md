# V2 implementation plan

This turn implements audit and Milestone 2.1 only. Keep existing routes/design and GitHub Pages hash deployment.

1. Repair foundation: title/search/filter linkage, readable formatting, extracted Settings and analysis views; regression tests.
2. Database: versioned content catalog, profiles, owned draft/progress/session tables, server-owned attempt schemas, private verified results, narrowly granted RPCs for atomic revision-checked saves and guest import. SQL validation and owner-only RLS.
3. Frontend: configured Supabase client, email OTP flow (avoids hash-token collision), session lifecycle, explicit Save/Reload, guest local storage, logged-in cloud storage, explicit guest migration preserving existing cloud records, profile and export interface.
4. Verification: actual PostgreSQL migrations + two independent users/role sessions for ownership and protected write tests; unit tests for schema/storage/conflicts; browser tests for guest recovery and regression. Hosted Auth tests require supplied project configuration and must not be claimed from mocks.
5. CI: production Pages-mode browser tests and RLS suite before deployment; public configuration via repository variables; no server secrets in build.

Follow-on boundaries: 2.2 seeded living dataset and reusable prediction/experiment engine; 2.3 Python worker/Monaco and private quiz grading; 2.4 authenticated AI; 2.5 notebook/mastery/activity; 2.6 full journey release validation. Do not implement these prematurely.
