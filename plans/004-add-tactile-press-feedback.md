# 004 — Add tactile active press feedback on interactive buttons and pills

- **Status**: TODO
- **Commit**: e19bcb1
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 1 file (`app/contractacio/contractacio.css`), ~25 lines

## Problem

On `/contractacio`, primary actions — including the format booking CTA buttons (`.contract-card-btn--primary`), rider download links (`.contract-doc-download-btn`), and filter pills (`.contract-quick-pill`) — lack an `:active` state.

```css
/* app/contractacio/contractacio.css:346-357 — current */
.contract-card-btn--primary {
  background-color: #E20000;
  color: #FFFFFF;
  flex-grow: 1;
  box-shadow: 0 4px 14px rgba(226, 0, 0, 0.3);
}

.contract-card-btn--primary:hover {
  background-color: #000000;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}
/* No :active rule defined */
```

While `.contract-submit-btn` in the modal has `:active { transform: scale(0.98); }`, the format cards and rider buttons feel rigid and unresponsive when clicked on desktop or tapped on touchscreens.

Per Emil Kowalski's tactile rules:
> "Press feedback: `transform: scale(0.97)` on `:active` with `transition: transform 160ms ease-out`. Keep it subtle (0.95–0.98)."

## Target

Add subtle `:active` compression states with quick response duration:

```css
/* target */
.contract-quick-pill:active {
  transform: scale(0.96);
  transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
}

.contract-card-btn:active {
  transform: scale(0.97);
  transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
}

.contract-doc-download-btn:active {
  transform: scale(0.97);
  transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Repo conventions to follow

- Existing `.contract-submit-btn:active` at line 735 uses `transform: scale(0.98)`.
- Use `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out` for snappy press response.

## Steps

1. In `app/contractacio/contractacio.css`, right after `.contract-quick-pill:hover` (around line 114), add `.contract-quick-pill:active { transform: scale(0.96); }`.
2. Right after `.contract-card-btn--secondary:hover` (around line 370), add `.contract-card-btn:active { transform: scale(0.97); }`.
3. Right after `.contract-doc-download-btn:hover` (around line 452), add `.contract-doc-download-btn:active { transform: scale(0.97); }`.

## Boundaries

- Do NOT change hover states or resting dimensions.
- Scale must remain in the range `0.96` to `0.97` (never go below `0.95`, which feels squishy).

## Verification

- **Mechanical**: Run `npm run build` to verify clean build.
- **Feel check**:
  - Click and hold down the mouse on "Sol·licitar disponibilitat" on any format card.
  - Notice the immediate, tactile press compression (`scale(0.97)`).
  - Release mouse and verify it snaps back cleanly.
  - Test on touch device or mobile emulation to confirm tap gives instant tactile confirmation.
- **Done when**: Every primary and secondary interactive button and pill gives responsive, subtle press feedback on click/tap.
