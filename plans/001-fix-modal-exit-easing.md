# 001 — Fix modal exit easing from sluggish ease-in to snappy ease-out

- **Status**: TODO
- **Commit**: e19bcb1
- **Severity**: HIGH
- **Category**: Easing & duration
- **Estimated scope**: 1 file (`app/contractacio/ContractacioClient.tsx`), ~20 lines

## Problem

When the booking inquiry modal is dismissed (via the close button, clicking the backdrop, or pressing Escape), GSAP animates both the card and the backdrop using `ease: "power2.in"`.

```typescript
/* app/contractacio/ContractacioClient.tsx:158-172 — current */
    tl.to(card, {
      opacity: 0,
      y: 25,
      scale: 0.94,
      duration: 0.22,
      ease: "power2.in",
    }).to(
      backdrop,
      {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      "-=0.1"
    );
```

Per Emil Kowalski's animation rules, `ease-in` on UI exits is always a finding. It starts slowly, delaying visual confirmation at the exact instant the user initiates dismissal. The modal feels sticky and unresponsive. Exiting UI should start immediately at top speed and decelerate gently (`ease-out`).

## Target

Change modal exit easing to `power2.out` (or `cubic-bezier(0.16, 1, 0.3, 1)`), reduce translation distance from `25px` to `16px` (avoiding excessive downward drop), and tighten duration to `0.18s` for the card and `0.16s` for the backdrop.

```typescript
/* app/contractacio/ContractacioClient.tsx:158-172 — target */
    tl.to(card, {
      opacity: 0,
      y: 16,
      scale: 0.96,
      duration: 0.18,
      ease: "power2.out",
    }).to(
      backdrop,
      {
        opacity: 0,
        duration: 0.16,
        ease: "power2.out",
      },
      "-=0.08"
    );
```

## Repo conventions to follow

- GSAP 3 is imported and used in `ContractacioClient.tsx`.
- Standard easing for UI entrances is `power2.out` / `power3.out`.
- Modal state management: `handleCloseModal` uses `modalTimelineRef.current` and invokes `setIsModalOpen(false)` on timeline complete.

## Steps

1. In `app/contractacio/ContractacioClient.tsx`, locate `handleCloseModal` around line 150.
2. Replace `ease: "power2.in"` on `card` with `ease: "power2.out"`.
3. Adjust `card` exit values: `y: 16`, `scale: 0.96`, `duration: 0.18`.
4. Replace `ease: "power2.in"` on `backdrop` with `ease: "power2.out"`, with `duration: 0.16` and timeline offset `"-=0.08"`.

## Boundaries

- Do NOT touch the entrance animation timeline (`useEffect` at line 176).
- Do NOT alter the `onComplete` callback or modal state hooks.
- Do NOT touch form state or email submission handlers.

## Verification

- **Mechanical**: Run `npm run build` and ensure zero TypeScript or compilation errors.
- **Feel check**:
  - Open the booking modal on `/contractacio` by clicking any "Sol·licitar disponibilitat" button.
  - Press `Escape` or click the 'X' button.
  - Notice that the modal disappears immediately with zero perceived lag (starts fast, glides out smoothly).
  - Open Chrome DevTools Animations panel, set speed to 10%, dismiss the modal, and verify the card begins moving on frame 1 without delay.
- **Done when**: Dismissing the modal feels instantaneous and crisp rather than delayed or sticky.
