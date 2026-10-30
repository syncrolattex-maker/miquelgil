# 005 — Refine modal close button entrance and hover token cohesion

- **Status**: TODO
- **Commit**: e19bcb1
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 2 files (`app/contractacio/ContractacioClient.tsx`, `app/contractacio/contractacio.css`), ~20 lines

## Problem

The modal close button uses a bouncy, spinning entrance and an aggressive 90-degree hover rotation:

```typescript
/* app/contractacio/ContractacioClient.tsx:216-218 — current */
      tl.fromTo(
        closeBtn,
        { opacity: 0, scale: 0.6, rotation: -90 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: "back.out(2)" },
        "-=0.28"
      );
```

```css
/* app/contractacio/contractacio.css:594-599 — current */
.contract-modal-close:hover {
  background-color: #E20000;
  border-color: #E20000;
  color: #FFFFFF;
  transform: rotate(90deg) scale(1.08);
}
```

1. `back.out(2)` is a heavy cartoon bounce curve that clashes with the austere, sophisticated cultural editorial aesthetic of the site.
2. Rotating an '✕' icon by 90 degrees rotates it into a '+' (plus) icon, causing brief cognitive confusion for users expecting a close action.
3. The entrance animation starts at `scale: 0.6`, which feels overly dramatic for a small dismiss control.

## Target

1. In `app/contractacio/ContractacioClient.tsx`:
   - Animate `closeBtn` from `{ opacity: 0, scale: 0.9 }` to `{ opacity: 1, scale: 1 }` with `ease: "power2.out"` and duration `0.22s` (no rotation, no bounce).
2. In `app/contractacio/contractacio.css`:
   - On `.contract-modal-close:hover`, change background color to `#E20000`, border color to `#E20000`, color to `#FFFFFF`, and apply gentle `transform: scale(1.05)` (no `rotate(90deg)`).
   - On `.contract-modal-close:active`, apply `transform: scale(0.95)`.

## Repo conventions to follow

- Restrained editorial motion: preserve high contrast and clean lines.
- Consistent easing curves: align with `power2.out` / `cubic-bezier(0.16, 1, 0.3, 1)`.

## Steps

1. In `app/contractacio/ContractacioClient.tsx:216-218`:
   Replace `{ opacity: 0, scale: 0.6, rotation: -90 }` and `{ opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: "back.out(2)" }` with `{ opacity: 0, scale: 0.9 }` and `{ opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" }`.
2. In `app/contractacio/contractacio.css:594-600`:
   Replace `.contract-modal-close:hover { transform: rotate(90deg) scale(1.08); }` with `transform: scale(1.05);`.
3. Add `.contract-modal-close:active { transform: scale(0.95); }`.

## Boundaries

- Do NOT change close button sizing (`38px x 38px`) or positioning (`position: absolute; right: 24px; top: 24px`).
- Do NOT alter SVG icon markup.

## Verification

- **Mechanical**: Run `npm run build` to verify clean compilation.
- **Feel check**:
  - Open the booking modal.
  - Watch the close button appear: it fades and gently resolves into place in tandem with the header, without cartoon rubber-banding.
  - Hover over the close button: the '✕' remains an '✕' (no rotation into a '+'), glowing red with crisp `scale(1.05)`.
  - Click down to verify crisp active depression `scale(0.95)`.
- **Done when**: Close button entrance and hover feel mature, institutional, and cohesive with the rest of Miquel Gil's branding.
