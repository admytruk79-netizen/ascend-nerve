# ASCEND Path — Master System Document

Status: Governing reconstruction specification
Branch: `ascend-school-reconstruction`

## 1. Purpose

ASCEND Path is a School of Initiation delivered through a daily-practice application. The application is not a reading catalogue and not a timer-driven course. Its governing loop is:

**Practice → Observation → Reflection → Integration → Readiness → Progression**

Progression is authoritative in the Path Engine/backend. Timer completion alone never advances curriculum state.

This document governs curriculum presentation, application information architecture, UX ownership, practice behavior, reflection, Library context, Resonance, branches, advanced formation, and release discipline.

## 2. Protected infrastructure

The reconstruction must preserve:

- Capacitor app id `com.ascend.path`
- Capacitor app name `ASCEND Path`
- Capacitor web directory `www`
- Google Play application identity and signing relationship
- existing GitHub signing secrets and AAB workflow
- Supabase project/auth integration
- billing products and entitlement semantics
- existing progression, journal, entitlement and branch records

No visual reconstruction task may change those invariants without a separate explicit migration decision.

## 3. School hierarchy

ASCEND maintains **one canonical curriculum**. Software release labels such as 1.x or 2.0 describe implementation generations; they do not create separate curriculum versions or authorize canonical material to be removed or deferred.

### Phase I — Core Formation

Six phases, **24 canonical monthly modules**, six gates.

#### I · Foundation — Attention & Embodiment
1. Orientation to the Path
2. Embodied Attention
3. Breath & Rhythm
4. Directed Attention
Gate 1

#### II · Stability — Will & Regulation
5. Deliberate Action
6. Equanimity
7. Constructive Perception
8. Openness & Discernment
Gate 2

#### III · Perception — Inner Sensitivity
9. Inner Quiet
10. The Inner Witness
11. Sense Refinement
12. Imaginative Attention
Gate 3

#### IV · Integration — Self-Knowledge & Transformation
13. Patterns & Repetition
14. Resistance & Friction
15. Biography & Meaning
16. Values Into Action
Gate 4

#### V · Resonance — Relational & Subtle Practice
17. Relational Presence
18. Resonance & Differentiation
19. Compassion & Service
20. Energetic Literacy
Gate 5

#### VI · Synthesis — Independent Practice
21. Integration of Disciplines
22. Discernment & Responsibility
23. Independent Practice Design
24. The Open Gate
Gate 6

Phase I may also contain supporting, continuing and additional practices around the 24-module spine. These do **not** create extra Core months and are not optional Practice Branches. The current `development-program` / Akharata practice set belongs in this Phase I supporting/additional layer.

### Practice Branches

Practice Branches hold independent progression records and never advance Phase I or Phase II.

Canonical Practice Branches currently published:

- **Ancestral Roots** — 15-workshop independent branch
- **Energy & Bodywork** — 11-module independent practitioner-training branch

A Practice Branch may have its own repetition, readiness and safety requirements. Completing a branch cannot unlock or advance Core Formation or Phase II.

### Phase II — Advanced Formation

Phase II is **not** another 24-month block and is **not** an optional Practice Branch. It is the separate advanced formation sequence opened only through the Phase I Open Gate.

The canonical source sequence preserves I–XXVI plus its applied/parallel practices and XXVII as a later capstone. The current database implementation contains 35 published training records because applied practices such as IVa, XIa, XIIIa, XVa, XVIIa, XIXa, XXIa and XXIIa are represented as their own records. That implementation count must never be mistaken for 35 canonical numbered practices.

Phase II keeps its own prerequisites, minimum repetitions, source-defined spacing, maintenance frequencies, readiness states and overload rules. Missing numeral labels in the source sequence are not to be invented or filled by the UI.

**Open Gate rule:** Phase II may begin only when the authoritative final Phase I stage is `established`. Elapsed calendar time, a client-side month value, a visible button, or completion of a Practice Branch cannot satisfy this gate. The backend must reject Phase II progress writes before the Open Gate.

## 4. Placement and experience layers

Akharata placement, seasonal atmosphere, reflection artwork, and other semantic visual layers do not create curriculum months, phases, gates, degrees or progression state.

They may support:

- atmosphere
- reflection prompts
- semantic artwork
- Library context
- placement focus

They may never rename or reorder the canonical 24-month Core Formation.

## 5. Asset and placeholder governance

No placeholder, stub, draft asset, or scaffold module ships as final by convenience or default. This applies equally to visual assets (art, images, audio) and to code scaffolding (a module or renderer committed to satisfy the one-owner architecture before its real behavior is implemented).

Every placeholder or stub must carry, at the point it is introduced:

- an explicit TEMPORARY marker (a code comment, commit message, or tracked note — not silence)
- a named replacement owner and, where known, a target date or milestone
- a record of what "done" looks like for the replacement

A module that exists only to satisfy a target file structure (see section 14) but contains no real implementation is a stub, not a completed step, and must not be reported or treated as finished work. Orphaned assets committed but never wired into the running application (unused images, unreferenced scripts) are migration debt and should be identified and either finished, wired in, or removed — not left silently in the tree.

Every commissioned, licensed, or reused art asset records its source and, where applicable, credit — including seasonal/experience-layer artwork drawn from `assets/seasonal-art/`.

## 6. Primary application structure

```text
ASCEND Path
├── Today
│   ├── current phase/month
│   ├── one daily practice
│   ├── centered 2-second hold
│   ├── practice briefing
│   ├── manual start
│   ├── practice renderer
│   └── reflection/journal handoff
├── Path
│   ├── Phase I / six phases / 24 months / six gates
│   ├── Phase I additional & continuing practices
│   ├── Practice Branches
│   │   ├── Ancestral Roots
│   │   └── Energy & Bodywork
│   └── Phase II advanced formation
├── Journal
│   ├── current reflection
│   ├── observation first
│   ├── deeper reflection second
│   └── history/review
├── Library
│   ├── current-month recommendations
│   ├── teachings
│   ├── practices
│   ├── readings
│   ├── references
│   └── seasonal/visual material as support only
└── My ASCEND
    ├── current formation position
    ├── practice rhythm
    ├── Resonance
    ├── teacher/review layer
    └── account/access/settings
```

## 7. Daily flow

The normal practitioner flow is:

```text
Today
→ hold the actual central circle for 2 seconds
→ Practice Briefing
→ manual Begin
→ Practice Engine
→ Finish
→ Reflection artwork / prompt
→ Journal observation
→ Save
→ return to Today
```

The visible ritual artwork is not the hold target. The actual central circle owns the hold interaction. The surrounding scene remains scrollable and non-interactive unless explicitly assigned another action.

## 8. Today screen

Today must answer four questions immediately:

1. Where am I? — phase + canonical month
2. What do I do now? — one primary practice
3. How do I begin? — centered hold circle
4. What follows? — reflection/journal

Requirements:

- canonical title rendered immediately; no obsolete fallback title
- one unmistakable primary action
- no duplicate competing Begin actions before briefing
- hold target aligned exactly with the visible circle
- 2-second hold with progress and haptics
- manual start after briefing
- timer completion is practice completion only, not curriculum progression
- clear stop/exit path
- Journal handoff after practice

## 9. Path screen

Path is the School map, not a flat card list.

It must show:

- current Phase I Core Formation position
- six visually distinct Phase I groups
- four canonical months per group
- Gate after each group
- completed/current/locked state
- future months visible for orientation but not arbitrarily activatable
- Phase I additional/continuing practices clearly labeled as supporting work, not extra months
- Practice Branches visually separate and limited to Ancestral Roots and Energy & Bodywork unless another branch is explicitly approved into the canonical curriculum
- Phase II visually separate from Practice Branches
- Phase II locked until the backend confirms the Phase I Open Gate

The frontend renders Path Engine/backend state; it does not calculate readiness truth independently.

## 10. Journal and Reflection

Journal follows the principle **Observation first, interpretation cautiously**.

Primary layer:

- Observation
- Inner State
- Life Application

Secondary/deeper layer:

- Interpretation
- Unresolved
- Share with Teacher

Reflection artwork is selected semantically and supports the reflection. It does not define curriculum structure. Existing artwork in `assets/seasonal-art/` is an experience-layer asset set.

Journal must provide history/review so the practitioner can revisit previous entries and observe change over time.

Journal entries initiated from Phase I additional practices, Practice Branches or Phase II should preserve structured source context (curriculum layer, branch/path id, module id and module title) without creating a second Journal persistence authority.

## 11. Library

Library is contextual support.

Priority order:

1. For the current Phase I month or current Phase II practice
2. Current practice teaching/reference
3. Current Practice Branch context when a branch session is active
4. Broader Library exploration

Library recommendations are selected using canonical curriculum metadata. Obsolete stage-title maps are prohibited.

Reading Library material never advances Phase I, Phase II or a Practice Branch.

## 12. Resonance

The practitioner-facing name is **Resonance**.

Resonance may reflect patterns in saved observations and journal language. It cannot:

- declare attainment
- change readiness
- advance curriculum
- diagnose the user
- replace teacher/reviewer judgment where review is required

Principle: **Resonance reflects. It does not decide.**

This boundary must be stated to the practitioner inside the application, in plain language, at the point Resonance is presented — not held only as an internal design principle. Language should make clear that Resonance reflects patterns in the student's own record and does not diagnose, does not guarantee outcomes, and does not replace a teacher's judgment where review is required.

## 13. Account and entitlement UX

For a signed-in entitled practitioner, billing/login controls must not dominate My ASCEND.

Normal hierarchy:

1. current formation
2. practice rhythm
3. Resonance
4. teacher/review
5. settings/account

Purchase, restore, login and lifetime-key controls appear only when relevant to access state.

## 14. Technical ownership model

Target ownership:

```text
mobile-app/www/
  index.html                 shell/static screen structure
  app/
    bootstrap.js             startup/orchestration
    router.js                screen navigation + Android Back
    state.js                 shared presentation state
    screens/
      today.js
      path.js
      journal.js
      library.js
      me.js
    curriculum/
      path-engine.js
      readiness.js
    practices/
      observation.js
      breath.js
      sphere.js
      guided.js
      reflection.js
    data/
      backend-adapter.js
      auth.js
      entitlements.js
  styles/
    tokens.css
    base.css
    components.css
    screens.css
    responsive.css
```

Migration is incremental: proven backend/engine code is adapted, not gratuitously rewritten. A file existing at its target path is not the same as that concern being migrated — see section 5. A module is only a real owner once the legacy path it replaces has been retired per section 15.

## 15. One-owner rule

Every concern has one owner:

- static markup/components → structure
- design tokens/base/components/screens/responsive → visual system
- screen modules → screen rendering/state presentation
- Path Engine/backend → Phase I and Phase II progression/readiness truth
- branch progression RPCs → independent Practice Branch progression truth
- data adapters → persistence/auth/entitlements
- practice renderers → timer/breath/sphere/guided/haptics
- Capacitor → native bridge only

Runtime DOM-repair layers and competing CSS overrides are migration debt and must be retired as replacement owners become active.

## 16. Design system

The product should feel premium, cinematic, restrained and coherent.

- functional UI uses readable sans-serif typography
- decorative typography is limited and never harms legibility
- Day / Twilight / Night are atmospheric variants of one system
- one spacing scale
- one radius scale
- one card language
- one button language
- one circular interaction language
- no oversized headings consuming most of a phone viewport
- no flicker between screens
- reduced-motion respected
- tablet layouts receive dedicated responsive treatment

## 17. Interaction and accessibility

All migrated screens preserve:

- labels and roles
- keyboard behavior
- focus visibility
- Android Back behavior
- loading states
- error states
- empty states
- reduced motion
- touch targets appropriate for mobile

Android Back unwinds modal/overlay state before leaving the application.

Neuroinclusive standard — the celestial/ritual metaphor is an enhancement, never the only route. A complete, plain, conventional path through the same content and actions must remain available at all times:

- no flashing, strobing, sudden audio, autoplay speech, or motion that cannot be paused or stopped
- a reduced-motion mode that removes non-essential animation without removing function
- no essential label or action conveyed only through color, position, hover, or animation
- alt text for meaningful imagery; captions or transcripts for meditation audio and video where feasible
- readable text sizes, comfortable line length, and layouts that tolerate browser/OS zoom and larger text
- clear, plain language; a short orientation ("what this contains") before dense reflective or spiritual material
- touch targets and spacing appropriate for one-handed mobile use

## 18. Practice renderer contract

Every practice renderer must support a common lifecycle:

- prepare
- start
- pause where allowed
- resume where allowed
- stop
- complete practice
- exit without completion

Renderer completion reports practice completion to the authoritative progression layer but does not itself advance a month/gate.

Breathing/sphere renderers own their animation synchronization and timing. UI code does not duplicate timer authority.

## 19. Testing gates

### 19.1 Technical gates

Before release integration:

1. unit tests green
2. browser/Playwright integrity green
3. navigation/Android Back tested
4. hold/timer/reflection/journal flow tested
5. canonical Phase I 24-month hierarchy tested
6. Phase I additional practices confirmed not to create extra months or independent Core advancement
7. Ancestral Roots and Energy & Bodywork confirmed independent from Phase I and Phase II
8. Phase II Open Gate enforced both in UI state and server-side progress writes
9. duplicate/replayed branch and Phase II repetition submissions cannot double-count
10. Library context and gating tested for Phase I, active branch context and Phase II
11. entitled account state tested
12. tablet/mobile viewport tested
13. Capacitor sync
14. Android debug build
15. signed AAB only after explicit release integration

A technical gate passing is necessary but not sufficient — see 19.2.

### 19.2 User-outcome criteria

Technical gates confirm the application runs correctly; they do not by themselves confirm it works for a practitioner. Before release integration, also confirm:

- a first-time student can say what to do today within 10–15 seconds of opening the app, without instruction
- a student can complete Today → Practice Briefing → Practice → Finish → Journal without hesitation or getting stuck
- a student can tell, at a glance, which items are Phase I Core, Phase I additional work, optional Practice Branches, or Phase II
- a student can tell, at a glance, which Library or Path items are available now versus locked
- a student encountering Resonance understands, without being told separately, that it reflects rather than decides
- reduced-motion and keyboard-only use do not degrade any of the above

## 20. Reconstruction execution order

1. Protect Android/Play invariants
2. Establish master document and one-owner architecture
3. Establish canonical style system
4. Establish shell/router/state
5. Reconstruct Today
6. Reconstruct Path around Phase I / Phase I additional work / Practice Branches / Phase II
7. Enforce Phase I Open Gate before any Phase II progress write
8. Reconstruct Journal/Reflection with structured curriculum context
9. Reconstruct Library with Phase I / branch / Phase II context
10. Reconstruct My ASCEND/Resonance
11. Normalize practice renderers including breathing/sphere/haptics
12. Retire obsolete runtime repair scripts and CSS owners
13. Full curriculum regression and device validation
14. Integrate intentionally into release branch
15. Build signed AAB

## 21. Current implementation rule

The reconstruction branch is a preview/development branch. It must not change Play signing, package identity, backend credentials or billing identity. Production release follows only after the reconstructed frontend has passed the validation gates above.

Current database curriculum inventory at this reconstruction checkpoint:

- Phase I Core Formation: 24 canonical monthly modules represented through the existing Core progression architecture
- Phase I additional/supporting Akharata / Development Program: 13 published training records
- Ancestral Roots: 15 published branch modules
- Energy & Bodywork: 11 published branch modules
- Phase II advanced formation (`sphere-of-attention` storage slug): 35 published implementation records representing the canonical advanced sequence plus applied/parallel practices

## 22. Decision Register

Open items surfaced during reconstruction, tracked here instead of left in chat history. Each carries a recommended default so work is not blocked pending discussion, and an owner/status so it isn't lost.

| ID | Decision | Recommended default | Owner / status |
|---|---|---|---|
| D-01 | `app/practices/{breath,sphere,guided,reflection,observation,contract}.js` existed per the section 14 target structure but were unwired stubs — the legacy `app.js` timer/practice logic and `practice-timer-authority.js` remained the real, running owners. `app/curriculum/{path-engine,readiness}.js` were the same shape: adapter modules added by their own `reconstruct:` commits with no follow-up wiring commit. | Resolved: `app/practices/runtime.js` now imports all five renderers and `bootstrap.js` calls `initPracticeRuntime()` during boot. `app/curriculum/path-engine.js` is now imported by `app/screens/{today,path,library}.js`, replacing their direct `window.ASCENDProgression`/`window.ASCENDMonthPath` reads with `PathEngine.current()`/`PathEngine.paint()` (same underlying calls, so behavior is unchanged; verified via unit and Playwright coverage). `app/curriculum/readiness.js` remains unwired — no ES-module screen currently owns readiness UI, so there is no call site to wire it into yet. Re-open if a readiness screen is added without adopting this adapter. | Resolved (practices, path-engine) / open (readiness — no consumer yet) |
| D-02 | PR #7 targets base branch `ascend-path-foundation`, not `main`. The `Build ASCEND Path Android Debug` workflow only triggers on PRs into `main`, so the Android debug gate does not automatically run for this PR. | Continue manual dispatch for reconstruction checkpoints until the merge path/workflow trigger is intentionally changed. | Resolved operationally / automatic trigger gap remains |
| D-03 | `path_stages.metadata.seasonal_images` in Supabase is no longer read by any code path after the season-based artwork refactor. | Leave the column as historical data; do not reintroduce a second source of truth for seasonal art. | Resolved — left in place, unread |
| D-04 | Whether the Resonance UI actually surfaces the "reflects, does not decide" boundary language required by section 12, or only holds it as an internal principle. | Audited: `mirror-engine.js` renders a user-facing boundary paragraph and includes teacher-review limits. | Resolved |
| D-05 | Section 17's neuroinclusive checklist (captions/transcripts for meditation audio, zoom tolerance, "what this contains" orientation) is new; current compliance across the app is unverified. | Audited current surfaces: reduced-motion, alt text, focus-visible styles and progressive Journal disclosure are present. No audio/video content exists yet, so captions/transcripts are not yet applicable. | Resolved for current surface — re-audit when audio/video is added |
| D-06 | Generic `training_branches` storage caused Phase I additional work, optional Practice Branches and Phase II to render in one UI bucket, and Phase II could be reached without an explicit server Open Gate check. | Resolved structurally: `development-program` renders as Phase I additional work; only `ancestral-roots` and `energy-bodywork` render as Practice Branches; `sphere-of-attention` renders as Phase II. `path_phase_ii_access()` reports the authoritative gate state, and a database trigger rejects Phase II repetition-log writes unless the final Phase I stage is `established`. | Resolved in reconstruction / regression coverage required before release |
