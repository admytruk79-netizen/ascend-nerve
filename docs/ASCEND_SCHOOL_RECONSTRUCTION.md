# ASCEND School Reconstruction

Branch: `ascend-school-reconstruction`

## Goal

Reconstruct the ASCEND web frontend inside the existing application while preserving the Android/Google Play distribution identity, Capacitor wrapper, backend connections, authentication, billing identifiers, and signing pipeline.

## Protected infrastructure

The following are invariants during the reconstruction and must not be changed without an explicit migration decision:

- Capacitor app id: `com.ascend.path`
- Capacitor app name: `ASCEND Path`
- Capacitor web directory: `www`
- Existing Google Play application identity and upload-signing relationship
- GitHub Actions signing-secret names and keystore workflow
- Supabase project/auth integration
- Billing product identifiers and entitlement semantics
- Existing user progression, journal, entitlement, and branch records

## Current architectural problem

The existing frontend has accumulated multiple visual and behavioral layers. Structure is defined in `index.html`, application state/rendering in `app.js`, while additional scripts and styles mutate screens after load. Multiple generations of CSS are loaded simultaneously. This creates competing ownership of layout, labels, state presentation, and interaction behavior.

The reconstruction must remove this ambiguity. Every concern gets one owner:

- markup/components own structure
- design-system CSS owns visual tokens and component appearance
- screen modules own screen-specific rendering
- Path Engine owns progression and readiness
- data adapters own Supabase persistence
- practice renderers own timers, breathing/sphere, guided practice, and haptics
- Capacitor owns native integration only

## Target application structure

```text
mobile-app/www/
  index.html
  app/
    bootstrap.js
    router.js
    state.js
    screens/
      today.js
      path.js
      journal.js
      library.js
      me.js
    components/
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

This is a migration target, not a requirement to rename every working file immediately. Working backend and engine code should be extracted incrementally rather than rewritten without need.

## School model

The UI will present ASCEND as a School while preserving the existing curriculum hierarchy:

- Phase I: existing 24-month Core Formation
- Practice Branches: independent progression, including Ancestral Roots
- Phase II: advanced formation sequence

The frontend must not hard-code progression truth. It renders the state returned by the Path Engine/backend.

## Migration rules

1. No direct production-branch rewrite.
2. No signing, app-id, OAuth, billing, or backend credential changes as part of visual reconstruction.
3. No new runtime DOM-repair scripts.
4. No new CSS override layer unless it replaces an older owner in the same change.
5. Existing data must remain backward compatible until a versioned migration is deployed.
6. Every migrated screen must retain accessibility labels, keyboard behavior, Android back behavior, loading/error/empty states, and reduced-motion behavior.
7. Every structural change must be covered by unit or Playwright regression tests before it replaces the old implementation.
8. A timer completion alone never equals curriculum completion; progression remains backend-authoritative.

## Reconstruction order

1. Protect Android/Play invariants with tests.
2. Inventory CSS and JS ownership and mark keep/merge/retire.
3. Introduce one canonical design-token layer.
4. Reconstruct application shell/navigation without changing backend contracts.
5. Reconstruct Today.
6. Reconstruct Path around School / Phase I / Branches / Phase II.
7. Reconnect Journal, Library and Mirror/Resonance.
8. Normalize practice renderer interface and reconnect breathing/sphere/haptics.
9. Remove retired override files only after replacement coverage is green.
10. Run browser regression, Capacitor sync, Android debug test, then signed AAB build.

## Release rule

The reconstruction branch is not a Play release branch. The existing signed AAB workflow remains unchanged during reconstruction. A release is made only after the rebuilt web frontend passes tests and is intentionally integrated back into the established release branch.
