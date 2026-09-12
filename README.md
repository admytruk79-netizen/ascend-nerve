# ASCEND Path

ASCEND Path is the native mobile implementation of the ASCEND 24-month neophyte curriculum.

This branch establishes the foundation for the product formerly explored as `ascend-nerve`.

## Product model

ASCEND Path is not a meditation library. The core progression loop is:

`Student -> Practice -> Observation -> Reflection -> Integration -> Readiness -> Next Stage`

Progression is cumulative. Earlier disciplines remain active as maintenance practices while new stages are introduced.

## Architecture

- Native mobile client: React Native / Expo
- Backend: existing ASCEND Supabase project
- Curriculum authority: deterministic Path Engine
- AI support: Mirror reflection engine, subordinate to curriculum rules
- Journal: private by default; explicit sharing with teacher
- Teacher layer: review and progression approval where required

## Branch status

`ascend-path-foundation` is the implementation branch for the new architecture. The existing `main` branch has not been replaced.

## Backend foundation

The Supabase project now contains isolated `path_*` tables for phases, stages, practices, student progress, sessions, journal entries, attainment markers, weekly reviews, teacher relationships, content gating, and AI reflections. Row-level security is enabled.

## Next implementation blocks

1. Native app scaffold and navigation: Today, Path, Journal, Library, Me.
2. Curriculum master map and stage seed data.
3. Practice/session logging and offline sync.
4. Stage Review and attainment-marker workflow.
5. Mirror AI endpoint with curriculum-grounded retrieval and a non-oracular response contract.
6. Teacher console.

See `docs/ARCHITECTURE.md` and `docs/AI_ENGINE_CONTRACT.md`.
