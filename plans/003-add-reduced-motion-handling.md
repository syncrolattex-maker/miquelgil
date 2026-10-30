# 003 — Add prefers-reduced-motion handling for modal and card transforms

- **Status**: TODO
- **Commit**: e19bcb1
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files (`app/contractacio/ContractacioClient.tsx`, `app/contractacio/contractacio.css`), ~35 lines

## Problem

Currently, `/contractacio` has zero accommodation for users who have requested reduced motion in their OS or browser settings.

```typescript
/* app/contractacio/ContractacioClient.tsx:190-230 — current */
    tl.fromTo(
      card,
      { opacity: 0, y: 40, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.46, ease: "power3.out" },
      "-=0.2"
    );
```

```css
/* app/contractacio/contractacio.css:211 — current */
.contract-format-card:hover {
  transform: translateY(-4px);
}
```

The modal translates 40px vertically, scales from 0.92, rotates the close button 90 degrees, and staggers form fields. Cards translate vertically on hover. For users sensitive to vestibular motion, sudden large position shifts and rotations can induce disorientation or nausea.

Per Emil Kowalski's guidelines:
> "Reduced motion means fewer and gentler animations, not zero — keep transitions that aid comprehension, remove position changes. In JS: check `prefers-reduced-motion` and branch transform values."

## Target

1. In `app/contractacio/ContractacioClient.tsx`:
   Check `window.matchMedia("(prefers-reduced-motion: reduce)").matches`. When true:
   - Card entrance: pure opacity fade (`opacity: 0 -> 1`), zero translation (`y: 0`), zero scale (`scale: 1`), duration `0.2s`.
   - Close button entrance: pure opacity fade (`opacity: 0 -> 1`), zero rotation, duration `0.15s`.
   - Form fields: immediate opacity or single quick group fade, zero stagger, zero translation.
   - Card exit: pure opacity fade (`opacity: 1 -> 0`), duration `0.15s`.

2. In `app/contractacio/contractacio.css`:
   Add a `@media (prefers-reduced-motion: reduce)` block resetting card, button, and pill hover/active translations:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .contract-format-card:hover,
     .contract-doc-card:hover,
     .contract-card-btn--primary:hover,
     .contract-submit-btn:hover,
     .contract-modal-close:hover {
       transform: none !important;
     }
   }
   ```

## Repo conventions to follow

- SSR-safe browser API checks: ensure `typeof window !== "undefined"` before querying `window.matchMedia`.
- GSAP timeline remains intact, only animation properties/options branch based on the reduced motion flag.

## Steps

1. In `app/contractacio/ContractacioClient.tsx`:
   Define a helper inside or above the component:
   ```typescript
   const prefersReducedMotion = () =>
     typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   ```
2. In `handleCloseModal`:
   If `prefersReducedMotion()`, animate `card` with `{ opacity: 0, duration: 0.15 }` and `backdrop` with `{ opacity: 0, duration: 0.15 }`.
3. In modal entrance `useEffect`:
   If `prefersReducedMotion()`, animate `backdrop` to opacity 1 (0.2s), `card` to opacity 1 (0.2s) without y/scale, and `closeBtn`/`formFields` to opacity 1 without y/rotation.
4. In `app/contractacio/contractacio.css`:
   Append the `@media (prefers-reduced-motion: reduce)` block to eliminate disruptive hover translates while preserving clean color and opacity transitions.

## Boundaries

- Do NOT break or eliminate opacity fading — reduced motion keeps opacity cues.
- Do NOT disable modal open/close functionality.

## Verification

- **Mechanical**: Run `npm run build` to verify clean build.
- **Feel check**:
  - In Chrome DevTools: Open **Rendering** tab (Ctrl+Shift+P > "Show Rendering").
  - Under "Emulate CSS media feature prefers-reduced-motion", select **prefers-reduced-motion: reduce**.
  - Open the modal on `/contractacio`.
  - Confirm:
    1. Modal card appears cleanly with a gentle fade, without flying up from `y: 40` or scaling from `0.92`.
    2. Close button does not spin into place.
    3. Hovering over format cards changes background/border color but does not shift vertically.
  - Disable the emulation and verify standard motion still runs as expected.
- **Done when**: With reduced motion enabled, all position shifts, scales, and rotations are suppressed, retaining only soft opacity/color feedback.
