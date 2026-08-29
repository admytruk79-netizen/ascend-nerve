# ASCEND Path Architecture

## Product principle

ASCEND Path measures formation, not content consumption.

The application presents one clear daily action while a deeper 24-month curriculum engine manages prerequisites, continuing practices, minimum duration, readiness, gated content, and teacher review.

Within the multi-month consolidation stages, calendar time alone never opens the next monthly unit. A formation unit requires a minimum 21-day span plus confirmed practice days, at least one journal reflection, and ordinary-life application evidence. Major stage gates remain server-side readiness decisions and, where configured, teacher-reviewed.

## UX surfaces

### Today
Current stage, primary practice, daily rhythm, next review.

### Path
Cinematic vertical journey grouped into major gates. Future stages are visible but quiet; restricted stages remain gated.

### Practice
Immersive instructions, timer/audio, completion, reflection.

### Journal
Observation, body sensation, inner state, resistance, life application, interpretation, unresolved questions, and optional teacher sharing.

### Stage Review
Practice consistency + life-expression markers + inner markers + optional teacher review. No automatic advancement merely because calendar time elapsed.

### Mirror
AI reflection over the student's own record. It can summarize, compare and ask questions. It cannot declare spiritual attainment or objective metaphysical truth.

### Library
Stage-aware teachings, practices, Qigong, audio, readings and references. A deterministic recommendation engine (`library-engine.js`) surfaces a "Recommended for You" rail using recency weighting, Part-fairness, journal-keyword overlap and a foundation-gate signal — no AI or network call beyond the existing Supabase reads.

### Independent Pathways
Specialized branches beyond Core Formation (`training_branches` / `training_branch_modules`): Sphere of Attention (positioned as the Primary Path continuation), Energy & Bodywork, Ancestral Roots, and the Development Program. Sequenced within each branch (no skipping ahead), gated as a whole behind a passed Foundation Review (Core Formation stage progression, not elapsed time), with an in-app Preparation Gate on enhanced-intensity modules.

## Core domain model

`Path -> Phase -> Stage -> Practice -> Session -> Reflection -> Readiness`

A stage owns:

- minimum days
- required practice days
- primary practice
- continuing practices
- supporting material
- discipline markers
- life-expression markers
- traditional/Steiner markers where intentionally included
- ASCEND markers
- progression mode
- teacher-review requirement

## Two-brain design

### Deterministic Path Engine
Owns curriculum truth:

- current stage
- prerequisites
- timing
- required practice days
- ongoing maintenance practices
- content unlocks
- readiness state
- teacher-review requirement

### AI Reflection Engine
Subordinate to the Path Engine:

- weekly summaries
- recurring-theme detection
- comparisons to earlier entries
- reflection prompts
- retrieval of relevant ASCEND curriculum material
- teacher briefing summaries

It never decides that a chakra is open, that an attainment has objectively occurred, or that a student is spiritually ready.

## Backend

The existing ASCEND Supabase project is the initial backend. All new tables are prefixed `path_` to isolate Path from the existing ASCEND Keys data.

Core tables:

- `path_profiles`
- `path_phases`
- `path_stages` (`teacher_review_required` gates stages 7-9 on a teacher decision, not elapsed time)
- `path_practices`
- `path_stage_practices`
- `path_student_progress`
- `path_practice_sessions`
- `path_journal_entries` (`share_with_teacher`, real per-entry checkbox in the Journal UI)
- `path_attainment_markers`
- `path_student_marker_observations`
- `path_weekly_reviews`
- `path_teachers` — explicit allowlist; provisioned by hand, never inferred or self-granted
- `path_teacher_relationships` — teacher/student links; created only via the `path_add_student` RPC (an allowlisted teacher adding a student by email), never self-requested
- `path_teacher_reviews` — stage-level decisions (`advance` / `continue` / `pause`) with optional guidance text
- `path_content_items`
- `path_content_unlock_rules`
- `path_ai_reflections`
- `training_branches` / `training_branch_modules` / `training_branch_progress` — Independent Pathways content and per-student progress

RLS is enabled. Student-private records are restricted to the authenticated owner, with one narrow exception: a linked, active teacher may read a journal entry whose `share_with_teacher` flag is set. Advancing past a `teacher_review_required` stage is enforced server-side in `path_submit_readiness_review` — it will not advance without a stored `path_teacher_reviews` row decisioned `advance`, submitted after the review was requested.

## Client architecture

Built stack (superseding the React Native/Expo plan below, which was never started):

- Plain HTML/CSS/vanilla JS (`mobile-app/www`), no framework or build step
- Capacitor wraps the same web app for the Android build
- Supabase Auth and REST client (`backend.js`), no ORM
- `localStorage` cache for offline practice/journal entries and history-based engines (Library recommendations, Resonance-style logic)
- Deployed as both a GitHub Pages web preview and an Android debug/AAB build (see `.github/workflows/`)
- `mobile-app/tests/*.test.mjs` (Node's built-in test runner) plus Playwright e2e; CI blocks the Android build and Pages deploy on these passing

Primary navigation:

`Today | Path | Journal | Library | Me`

## Access model

ASCEND Path has no free curriculum tier. Authentication creates an account but
does not grant access. The client and Supabase RLS both require one of:

- active `premium` access, created only after server-side Google Play purchase
  verification; or
- `lifetime` access, created by a one-time tester key or an explicit manual grant.

The `ascend_entitlements` row is authoritative. Developmental gates inside the
24-month Path remain readiness-based and are independent of purchase status.
Payment unlocks the school; it never advances a student through the curriculum.

## Privacy

Journal entries are private by default. Teacher visibility is explicit, not automatic. Account information, spiritual journal data and anonymous product analytics should remain logically separate.

## Execution sequence

1. Backend schema and RLS — done.
2. Curriculum Master Map and seed model — done (24-month Core Formation + 4 Independent Pathways, 74+ modules).
3. Client scaffold and core navigation — done (web, not native; see Client architecture).
4. Session logging, journal and offline cache — done.
5. Stage Review and attainment markers — done.
6. Mirror AI endpoint and curriculum retrieval — done (`mirror-engine.js`, `path_mirror_snapshot`).
7. Teacher console — done: `path_teachers` allowlist, `path_add_student` RPC, stage-decision UI in `teacher-console.js`.
8. Audio, notifications, analytics, QA and release — not started.
