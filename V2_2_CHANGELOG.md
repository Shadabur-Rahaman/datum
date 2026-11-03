# DATUM V2.2 — package 0.3.0

- FIXED: debounced autosave (1.2 seconds), local recovery surviving reload, owner-scoped private recovery, stale-revision rejection and preservation of edits during an in-flight save.
- FIXED: password signup, login, reset and authenticated password changes alongside existing OTP. PKCE callback detection preserves Pages hash routes. Hosted acceptance is BLOCKED pending project configuration.
- FIXED: all twelve lessons have computed interactive activities, prediction, knowledge and applied checks, reflection, hints and persisted practice attempts. Existing hypothesis interaction and old reflections remain intact.
- FIXED: 36 new protected assessment questions, six per chapter; separate six-question public practice bank; chapter navigation, elapsed timer, retry mistakes, explanations and persistent history. Original twelve-question assessment remains available.
- FIXED: real Python run context reaches the debugger. Tutor, reviewer and navigator share one authenticated gateway, bounded recent conversation, progressive authored hints, optional quota-charged Groq fallback and owner-only request statistics.
- FIXED: lab configuration undo, ten recipe snapshots, thirty history entries, three investigation templates, dataset dictionary, original-versus-analysis Python views and deterministic evidence checklist.
- FIXED: notebook search, status filters, five-entry pagination, partial-edit recovery, mission/chart references and deterministic UUID merge on guest import. Thirty-entry cap retained deliberately.
- FIXED: transparent recent distinct-objective skill rules, weak-area recommendations, lesson/hint evidence and activity timeline. Guest practice never becomes verified mastery.
- VERIFIED baseline: 40 unit, 35 database and 50 browser tests passed before changes. See V2_2_TEST_REPORT.md for release results.
