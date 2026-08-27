# ASCEND Twilight Today — Design QA

## Evidence

- Source truth: `/workspace/scratch/d9e6b56127be/generated_images/exec-6aec550e-e315-41d5-9f73-4b107d9fc46e.png`
- Normalized source: `/workspace/scratch/ascend-design-qa/design-reference-normalized.png`
- Implemented screenshot: `/workspace/scratch/ascend-twilight-verified-20260827.jpg`
- Final comparison: `/workspace/scratch/ascend-design-qa/design-comparison-final.jpg`
- Target viewport: 390 × 844 CSS pixels
- Source dimensions: 852 × 1846, normalized to 390 × 844
- Implementation capture: browser-rendered 390 × 844 mobile app crop
- State: authenticated Lifetime member, Twilight mode, Today screen, ritual portal idle

## Visual comparison

The implementation preserves the approved hierarchy and interaction landmarks: compact branded header, Twilight context, practice title and duration, circular hold portal, visible practice fallback button, three-step journey rail, Journal continuation row, and persistent bottom navigation. The production background was recropped to retain the luminous path and mountain horizon while keeping the hold target large enough for a mobile thumb.

Focused-region review was performed on the portal, action button, journey rail, Journal row, and bottom navigation. A separate focused screenshot was not needed because all five regions are simultaneously visible at the target viewport.

## Iterations

1. The first pass compressed the winding path and the mobile capture omitted the bottom navigation. The hero crop, portal scale, and QA viewport navigation constraint were corrected.
2. The second pass restored the full interaction hierarchy and visible navigation. The final crop increased the scene height and adjusted background scale to reveal more of the path without displacing the primary action.

## Functional verification

- Lifetime/Premium access hides Annual, Monthly, Lifetime, and Restore Purchases controls.
- Unentitled accounts retain purchase and tester-key controls.
- Begin Practice opens the existing practice overlay.
- The Journal continuation row opens Journal.
- Enter on the hold portal provides an accessible keyboard path.
- Android/browser Back closes overlays first and then returns through ASCEND screens without leaving the app.
- Hold progress, early-release cancellation, and vibration fallback are covered by integrity tests.
- Browser console showed no application errors; only unrelated browser-extension metadata messages appeared.

## Remaining differences

- P3: The reference uses richer custom bottom-navigation icons; the implementation retains the existing simpler app navigation treatment for consistency and legibility.
- P3: Browser screenshot resampling softens the generated hero artwork slightly; the shipped source asset remains full resolution.

## Final result

Passed. No actionable P0, P1, or P2 visual or interaction mismatches remain.
