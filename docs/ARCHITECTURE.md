# ASCEND Path Architecture

## Product principle

ASCEND Path measures formation, not content consumption.

The application presents one clear daily action while a deeper 24-month curriculum engine manages prerequisites, continuing practices, minimum duration, readiness, gated content, and teacher review.

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
Stage-aware teachings, practices, Qigong, audio, readings and references.

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
- `path_stages`
- `path_practices`
- `path_stage_practices`
- `path_student_progress`
- `path_practice_sessions`
- `path_journal_entries`
- `path_attainment_markers`
- `path_student_marker_observations`
- `path_weekly_reviews`
- `path_teacher_relationships`
- `path_teacher_reviews`
- `path_content_items`
- `path_content_unlock_rules`
- `path_ai_reflections`

RLS is enabled. Student-private records are restricted to the authenticated owner. Teacher reviews require an active teacher/student relationship.

## Client architecture

Recommended native stack:

- React Native / Expo
- TypeScript
- Supabase Auth and database client
- local persistent cache for today's practice and recent journal
- server-side AI endpoint; no model secret in the mobile client

Primary navigation:

`Today | Path | Journal | Library | Me`

## Privacy

Journal entries are private by default. Teacher visibility is explicit, not automatic. Account information, spiritual journal data and anonymous product analytics should remain logically separate.

## Execution sequence

1. Backend schema and RLS — started.
2. Curriculum Master Map and seed model.
3. Native client scaffold and core navigation.
4. Session logging, journal and offline cache.
5. Stage Review and attainment markers.
6. Mirror AI endpoint and curriculum retrieval.
7. Teacher console.
8. Audio, notifications, analytics, QA and release.
