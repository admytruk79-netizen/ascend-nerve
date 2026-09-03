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

### Phase I — Core Formation

Six phases, 24 months, six gates.

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

### Practice Branches

Practice Branches hold independent progression records and never advance Core Formation.

Canonical branch currently included:

- Ancestral Roots — 15-workshop independent branch

### Phase II — Advanced Formation

Phase II is separate from Phase I and opens by readiness. It is cumulative, long-form advanced formation. Missing numeral labels in the source sequence are not to be invented or filled by the UI.

## 4. Placement and experience layers

Akharata placement, seasonal atmosphere, reflection artwork, and other semantic visual layers do not create curriculum months, phases, gates, degrees or progression state.

They may support:

- atmosphere
- reflection prompts
- semantic artwork
- Library context
- placement focus

They may never rename or reorder the canonical 24-month Core Formation.

## 5. Primary application structure

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
│   ├── Practice Branches
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

## 6. Daily flow

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

## 7. Today screen

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

## 8. Path screen

Path is the School map, not a flat card list.

It must show:

- current Core Formation position
- six visually distinct phases
- four months per phase
- Gate after each phase
- completed/current/locked state
- future months visible for orientation but not arbitrarily activatable
- Practice Branches visually separate
- Phase II visually separate

The frontend renders Path Engine/backend state; it does not calculate readiness truth independently.

## 9. Journal and Reflection

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

## 10. Library

Library is contextual support.

Priority order:

1. For the current month
2. Current practice teaching/reference
3. Broader Library exploration

Library recommendations are selected using canonical month metadata. Obsolete stage-title maps are prohibited.

Reading Library material never advances Core Formation.

## 11. Resonance

The practitioner-facing name is **Resonance**.

Resonance may reflect patterns in saved observations and journal language. It cannot:

- declare attainment
- change readiness
- advance curriculum
- diagnose the user
- replace teacher/reviewer judgment where review is required

Principle: **Resonance reflects. It does not decide.**

## 12. Account and entitlement UX

For a signed-in entitled practitioner, billing/login controls must not dominate My ASCEND.

Normal hierarchy:

1. current formation
2. practice rhythm
3. Resonance
4. teacher/review
5. settings/account

Purchase, restore, login and lifetime-key controls appear only when relevant to access state.

## 13. Technical ownership model

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

Migration is incremental: proven backend/engine code is adapted, not gratuitously rewritten.

## 14. One-owner rule

Every concern has one owner:

- static markup/components → structure
- design tokens/base/components/screens/responsive → visual system
- screen modules → screen rendering/state presentation
- Path Engine/backend → progression/readiness truth
- data adapters → persistence/auth/entitlements
- practice renderers → timer/breath/sphere/guided/haptics
- Capacitor → native bridge only

Runtime DOM-repair layers and competing CSS overrides are migration debt and must be retired as replacement owners become active.

## 15. Design system

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

## 16. Interaction and accessibility

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

## 17. Practice renderer contract

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

## 18. Testing gates

Before release integration:

1. unit tests green
2. browser/Playwright integrity green
3. navigation/Android Back tested
4. hold/timer/reflection/journal flow tested
5. canonical 24-month hierarchy tested
6. branches confirmed independent
7. Library month gating tested
8. entitled account state tested
9. tablet/mobile viewport tested
10. Capacitor sync
11. Android debug build
12. signed AAB only after explicit release integration

## 19. Reconstruction execution order

1. Protect Android/Play invariants
2. Establish master document and one-owner architecture
3. Establish canonical style system
4. Establish shell/router/state
5. Reconstruct Today
6. Reconstruct Path
7. Reconstruct Journal/Reflection
8. Reconstruct Library
9. Reconstruct My ASCEND/Resonance
10. Normalize practice renderers including breathing/sphere/haptics
11. Retire obsolete runtime repair scripts and CSS owners
12. Full regression/device validation
13. Integrate intentionally into release branch
14. Build signed AAB

## 20. Current implementation rule

The reconstruction branch is a preview/development branch. It must not change Play signing, package identity, backend credentials or billing identity. Production release follows only after the reconstructed frontend has passed the validation gates above.
