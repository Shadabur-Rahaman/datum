# Content schema — version 1

Current executable schema: `src/content/track.ts` uses Zod at import. Track has version, title, exactly six chapters. Chapter has numeric id, title, description and exactly two lessons. Lesson has unique route id, title, minutes, question, concept and reflection prompt. These are twelve lesson previews, not completed assessments. Authored lesson text is original. UI lesson pages are data-driven.

The six sample delivery rows are hand-authored layout fixtures, with distance in km and duration in minutes; one missing duration is intentional. They have no population claims or generation seed and must not be confused with the later synthetic datasets.

Phase 3 dataset schema: id/version, seed, generator version, column types/units/nullable flags, generation method, limitations, learning objectives. Reproducible transforms include sample seed, numerical filters, missing-value strategy, outlier rule and selected groups. Predictions must precede result reveal.

Mission schema: id/version, story, dataset reference, objectives, skills, guarded steps, action evidence, rubric and completion criteria. Practice schema: problem, starter, inputs, expected behavior, at least two deterministic cases, hint ladder, explanation and skills. Quiz schema: stable question/option IDs, type, topic, difficulty, numeric tolerance and explanations; public prompts and private solutions must be separated. Randomization uses stable option IDs. Notebook schema: mission/run/data/version/transform/code references, reproducible chart specification, computed facts, hypothesis, conclusion, limitations and reflection.

Validate content and correct answers deterministically before publishing. Never accept an AI-generated answer key without authored ground truth.
