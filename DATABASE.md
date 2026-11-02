# Database plan — not implemented in Phase 1

Phase 2 will introduce Supabase PostgreSQL, Auth and Storage. No migrations, accounts or connected database are claimed in this delivery.

Content hierarchy: learning_tracks → chapters → lessons; skills and lesson_skill_links map learning objectives. Datasets include version/seed/generation metadata. Missions and mission_steps reference datasets. Practice_exercises and quizzes reference versioned content. Quiz_questions and quiz_options expose prompts/options only; solutions and trusted fixtures live in a private schema.

Owned records: profiles, user_mission_runs, experiments, practice_attempts, quiz_attempts, quiz_responses, user_lesson_progress, skill_evidence, user_skill_mastery, evidence_entries, ai_interactions and ai_usage_limits. Each owned record must carry a non-null user_id linked to auth.users; related parent ownership must be enforced, not merely a user_id on the child.

Use UUID identities where appropriate, foreign keys, uniqueness for user/content versions and attempt idempotency, timestamps, indexes on owner + updated_at and parent foreign keys. Immutable published versions preserve historical evidence meaning. Separate learner-writable draft fields from server-owned grades. RLS on every exposed table; published-only content read policies; owner-only draft policies; no learner writes to scores, mastery or published content. Administrative writes require server authorization. Private storage buckets use owner-qualified paths and ownership policies.

Phase 2 tests must cover anonymous published reads, unpublished denial, owner CRUD, cross-user denial, forged owner IDs, child-parent ownership mismatch, protected grading updates, retries and deletion cascades. Account deletion must delete Auth identity and associated private storage through an authenticated server workflow. Migrations and idempotent seeds will be delivered and verified in Phase 2, not represented by placeholder SQL now.
