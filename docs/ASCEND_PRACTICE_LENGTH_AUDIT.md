# ASCEND Path — Practice Length & School-Scale Audit

Status: Governing implementation audit for the UI/UX refinement branch
Date: September 2026

## 1. Finding

The curriculum has been expanded conceptually into a full School of Initiation, but the live Core practice payload is still partly inherited from the older nine-stage implementation.

The live `path_practices` / `path_stage_practices` primary assignments currently expose nine stage-level primary practices rather than twenty-four month-level primary practices. Current default minutes are:

| Stage | Primary practice | Current default |
|---|---|---:|
| 1 | Self-Contemplation at the Beginning of the Path | 10 min |
| 2 | Directed Thought | 10 min |
| 3 | Chosen Action | 5 min |
| 4 | Equanimity in Feeling | 10 min |
| 5 | Positive Perception | 10 min |
| 6 | Openness to New Perception | 10 min |
| 7 | Reverse Review of the Day | 12 min |
| 8 | Morning Practice · Energy Gain | 15 min |
| 9 | Seven Chakra Foundation | 30 min |

This is not yet equivalent to the canonical 24-month School experience.

## 2. Canonical practice-length standard

The School should not solve depth by making every timer longer. Depth comes from repetition, continuing disciplines, life application, journaling, readiness evidence and cumulative practice.

Default formal-practice envelope:

- **5–10 minutes** — introductory observation, natural breath, micro-practices, simple daily recalls, or source-defined short exercises.
- **10–15 minutes** — normal default for most Phase I primary formal practices.
- **15–20 minutes** — developed concentration, integration, guided embodiment, or later Phase I practices that benefit from settling time.
- **20–30 minutes** — exception only when the canonical source materially requires a multi-part or integrative practice. Prefer splitting preparation / primary work / observation rather than forcing a single uninterrupted timer.
- **Over 30 minutes** — not a normal Phase I daily-app default. Preserve only when the canonical source explicitly requires it, or present as a workshop/extended practice rather than the everyday primary action.

The module documents' repeated `10–20 minutes` architecture remains the general school-level envelope. Source-specific instructions override the generic envelope when genuinely necessary.

## 3. Required anatomy of each monthly practice

Each of the 24 Core months should resolve to a real practice experience with:

1. **Orientation** — what capacity is being trained and why it belongs here.
2. **Preparation** — posture/environment/attention setup; usually 1–2 minutes, not separately gamified.
3. **Primary formal practice** — one focused exercise, normally 10–20 minutes.
4. **Quiet completion** — 1–3 minutes to notice what is present before interpretation.
5. **Micro-practice / ordinary-life assignment** — a brief recall or application during the day.
6. **Continuing practice** — only the one or two earlier disciplines relevant to this month; never a wall of accumulated tasks.
7. **Journal handoff** — observation first; interpretation secondary.
8. **Readiness evidence** — practice consistency + concrete life expression + reflection; timer completion alone is insufficient.

This is how the product should feel like a School of Initiation without forcing 30–60 minute daily sessions.

## 4. Phase I duration direction

The following is an implementation envelope, not a replacement for canonical source text:

- Months 1–4 / Foundation: mostly **8–12 min**, with natural breath allowed at **5–10 min**.
- Months 5–8 / Stability: mostly **10–15 min**.
- Months 9–12 / Perception: mostly **12–15 min**, occasionally **15–18 min**.
- Months 13–16 / Integration: mostly **12–18 min**.
- Months 17–20 / Resonance: mostly **15–20 min**, with stronger stop/grounding language where relevant.
- Months 21–24 / Synthesis: mostly **15–20 min**, with the emphasis moving from longer timers toward coherent self-directed practice and readiness.

The student's total school engagement is larger than the timer because application and reflection continue outside the formal session.

## 5. Phase II

Do not normalize Phase II to the Phase I minute bands. Phase II preserves its own source-defined frequency, spacing, repetitions, maintenance requirements and non-compression rules. Some advanced practices are better represented by repetition/frequency/readiness than by a single countdown timer.

The app must therefore support practice definitions whose authority can be:

- timed session,
- repetition count,
- situational/application completion,
- source-defined cadence,
- readiness review,
- or a combination.

## 6. Practice Branches

Practice Branches remain independent.

- **Ancestral Roots** is a 15-workshop curriculum. A workshop can be longer than a daily Core practice; daily integration or repetition inside the workshop sequence should remain manageable.
- **Energy & Bodywork** should use source-defined session lengths once its 11 modules are fully mapped. Do not invent uniform timers merely for visual consistency.

## 7. Current implementation gaps

### Critical

- Core Today still resolves from nine stage-level primary practice assignments instead of a complete twenty-four-month primary-practice map.
- Therefore different canonical months can inherit the same legacy stage practice and duration.

### High

- The 5-minute `Chosen Action` record can be appropriate as an exercise itself, but it should not stand alone as the entire school experience for a month. It needs orientation, observation, life application and reflection around it.
- The 30-minute `Seven Chakra Foundation` record is outside the normal Phase I daily default and should be checked against its canonical source. If the complete work is genuinely 30 minutes, consider an extended-practice presentation or split sections rather than treating 30 minutes as the ordinary default for every student/session.

### Medium

- Current briefing duration is driven by `path_practices.default_minutes`; until the month-level practice map is authoritative, the UI cannot truthfully claim month-specific school-scale practice design.

## 8. Implementation sequence

1. Inventory the 24 canonical module documents and source instructions.
2. Define one month-level primary practice object per Core month.
3. Assign source-grounded duration/cadence using the envelope above.
4. Preserve necessary continuing practices separately rather than inflating the primary timer.
5. Add preparation, completion and journal prompts to the practice definition.
6. Add ordinary-life micro-practice / field assignment metadata.
7. Map each canonical month to its primary practice through an authoritative backend contract.
8. Keep the nine existing stages as readiness/progression groupings where needed; do not let them substitute for monthly practice identity.
9. Add tests asserting that all 24 Core months resolve to a real primary practice and that no month silently falls back to an unrelated stage-level exercise.
10. Re-test Today, timer, Journal, readiness and Android flows before release integration.

## 9. Release gate

ASCEND should not be described as a fully populated 24-month School-of-Initiation practice experience until all twenty-four canonical months resolve to intentional, source-grounded primary-practice definitions with appropriate duration/cadence and supporting integration work.
