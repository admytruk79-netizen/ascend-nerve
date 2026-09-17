# ASCEND Path — UI/UX Refinement Plan

Status: Active refinement plan
Baseline: `ascend-path-foundation`
Working branch: `ascend-uiux-refinement`

This plan translates the governing ASCEND master system into a release-facing UX pass. It also adapts the strongest product principles proven in the Lunaria Universalia product brief without importing Lunaria's visual identity or information architecture.

## 1. Governing rule

ASCEND remains a School of Initiation delivered through a daily-practice application. The UX must make the governing loop immediately legible:

**Practice → Observation → Reflection → Integration → Readiness → Progression**

Immersion supports this loop; it never obscures it.

## 2. Lunaria-derived principles adapted to ASCEND

### 2.1 Purpose legible within 10–15 seconds
A first-time practitioner should understand, without external instruction:
- what ASCEND is;
- where they are in the path;
- what to do now;
- what follows after practice.

Acceptance test: a new user can describe today's action and the Practice → Journal relationship within 10–15 seconds.

### 2.2 Immersive threshold + conventional route
The ritual/celestial presentation is an enhancement, not the only route.
- The centered hold circle is the primary ritual entry.
- A quiet conventional non-hold fallback remains available.
- Bottom navigation remains predictable.
- Reduced-motion removes non-essential animation without hiding actions.
- Android Back unwinds overlays before exiting.

### 2.3 One canonical destination, multiple contextual entrances
Do not duplicate curriculum objects because they appear in different contexts.
- One canonical practice may be entered from Today, Path, or a contextual recommendation, but it remains the same practice object and progression record.
- One Journal persistence authority receives reflections from Core, Phase I additional work, Practice Branches, and Phase II with structured context.
- One Library item may be surfaced from several contexts without becoming duplicate content.

### 2.4 Orientation before exploration
ASCEND may be deep, but the immediate screen should be simple.
- Today exposes one dominant action.
- Path begins with current position and current requirement before the broader school map.
- Journal begins with observation before deeper interpretation.
- Library leads with relevant current material before broad browsing.
- My ASCEND leads with formation/rhythm before account/billing controls.

### 2.5 Complete base experience before decorative expansion
Do not add more visual layers, animations, branches, audio or secondary destinations until the complete core loop is coherent on phone and tablet:

Today → Briefing → Practice → Finish → Journal → Save → Today.

When schedule or complexity pressure appears, simplify decorative motion before cutting accessibility, orientation, curriculum integrity, or completion feedback.

### 2.6 Distinct layers, one family
Core Formation, Phase I additional practices, Practice Branches, and Phase II must feel visually distinct enough to understand, while remaining one ASCEND system.

The distinction must use labels, hierarchy and structure—not color alone.

### 2.7 Progressive enhancement and performance
Critical practice state, navigation and current curriculum position load first. Atmospheric art, reflection imagery and noncritical enhancements must not delay or block the core action.

### 2.8 Predictability and recovery
Every meaningful state answers:
- where am I;
- what happened;
- what can I do next;
- how do I go back or stop;
- whether my action was actually recorded.

This is especially required for timer completion, practice completion, Journal save, locked curriculum states, offline/local fallback and authentication recovery.

## 3. Screen-by-screen refinement

### Today
- One dominant action: 2-second hold circle.
- Quiet non-hold accessibility fallback only.
- Current Phase + Month + canonical practice title visible before action.
- Reflection handoff subdued until practice completion, then clearly active.
- Completion feedback distinguishes timer complete, practice recorded and Journal saved.
- No duplicate Begin actions before briefing.

### Practice Briefing / Renderer
- Briefing explains objective, duration, continuing practices and stop/exit path.
- Manual Begin after briefing.
- Timer is not presented as curriculum advancement.
- Pause/stop/exit behavior remains obvious and recoverable.
- Screen sleep/background behavior must not silently log the user out or lose practice state.

### Path
- Current formation position first.
- Phase I six-phase/24-month map second.
- Phase I additional work clearly separate from Core months.
- Practice Branches clearly independent.
- Phase II visually separate and backend-locked until Open Gate.
- Future material visible quietly for orientation, never presented as available when locked.

### Journal
- Observation, Inner State and Life Application first.
- Interpretation, Unresolved and Teacher Sharing secondary.
- Source context visible when reflection came from a branch/additional/Phase II session.
- Save confirmation is explicit.
- History supports noticing change over time without gamification.

### Library
- Current-context recommendation first.
- Locked/available state readable without relying on color.
- Search/filter exploration follows contextual material.
- Provenance remains visible.
- Reading never implies progression credit.

### My ASCEND / Resonance
- Current Formation → Practice Rhythm → Resonance → Teacher/Review → Account.
- Resonance states in plain language that it reflects patterns from the student's record and does not diagnose, certify attainment or decide readiness.
- Billing/login controls do not dominate an entitled user's normal experience.

## 4. Visual system guardrails

- Premium, cinematic, restrained—not fantasy-game UI.
- Functional text is readable sans-serif.
- Deep navy/charcoal, antique gold, ivory and restrained teal activation remain the core family; Day mode is genuinely light rather than merely brighter dark mode.
- Day / Twilight / Night are environmental modes, not different information architectures.
- Generous negative space; avoid walls of cards.
- One card language, one button language, one circular interaction language.
- No oversized headings consuming the phone viewport.
- Strong contrast, visible focus, large-text tolerance, one-handed touch targets and reduced-motion parity.

## 5. Release UX acceptance gates

Before signed AAB release candidate:

1. New user understands the immediate task within 10–15 seconds.
2. Today has one unmistakable dominant action.
3. Non-hold and reduced-motion routes preserve all functionality.
4. Today → Briefing → Practice → Finish → Journal → Save → Today completes without hesitation or dead ends.
5. Timer completion, practice recording and Journal saving have visibly different confirmations.
6. Path hierarchy is understood at a glance: Core vs additional vs Branches vs Phase II.
7. Locked vs available content is understandable without color alone.
8. Journal source context is preserved and visible where relevant.
9. Resonance boundary is understandable in-product.
10. Android Back, refresh, background/resume and session persistence are tested.
11. Phone and tablet layouts pass readability/touch-target checks.
12. Decorative motion or imagery never blocks core state or action.

## 6. Current refinement order

1. Today hierarchy and accessibility fallback.
2. Practice briefing / completion / Journal handoff.
3. Path orientation and layer differentiation.
4. Journal field hierarchy and source-context visibility.
5. Library relevance / lock-state clarity.
6. My ASCEND / Resonance hierarchy and disclosure.
7. Day / Twilight / Night visual consistency and responsive polish.
8. Reduced-motion, keyboard, Android Back and large-text pass.
9. Physical-device regression.
10. Signed AAB release candidate only after all UX and technical gates pass.
