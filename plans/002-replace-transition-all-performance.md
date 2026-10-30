# 002 — Replace unconstrained transition: all with explicit composited properties

- **Status**: TODO
- **Commit**: e19bcb1
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file (`app/contractacio/contractacio.css`), ~50 lines

## Problem

Throughout `app/contractacio/contractacio.css`, interactive elements use generic `transition: all`.

```css
/* app/contractacio/contractacio.css:106 — current */
.contract-quick-pill {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* app/contractacio/contractacio.css:204 — current */
.contract-format-card {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* app/contractacio/contractacio.css:340 — current */
.contract-card-btn {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* app/contractacio/contractacio.css:388 — current */
.contract-doc-card {
  transition: all 0.25s ease;
}

/* app/contractacio/contractacio.css:444 — current */
.contract-doc-download-btn {
  transition: all 0.2s ease;
}

/* app/contractacio/contractacio.css:591 — current */
.contract-modal-close {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* app/contractacio/contractacio.css:724 — current */
.contract-submit-btn {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
```

`transition: all` is an anti-pattern: it forces the browser engine to monitor every CSS property for changes on every frame, causing unnecessary style recalculations on non-composited properties (padding, border, colors, shadows) during scroll or state shifts.

## Target

Replace each `transition: all` with targeted, explicitly listed transition properties (`transform`, `opacity`, `background-color`, `border-color`, `box-shadow`, `color`). Where `transform` is animated, pair it with hardware-accelerated easing.

```css
/* target */
.contract-quick-pill {
  transition: background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.contract-format-card {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.25s ease,
              border-color 0.25s ease;
}

.contract-card-btn {
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.2s ease,
              box-shadow 0.2s ease,
              color 0.2s ease,
              border-color 0.2s ease;
}

.contract-doc-card {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.22s ease,
              border-color 0.22s ease;
}

.contract-doc-download-btn {
  transition: background-color 0.18s ease,
              color 0.18s ease,
              transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.contract-modal-close {
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.2s ease,
              border-color 0.2s ease,
              color 0.2s ease;
}

.contract-submit-btn {
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.2s ease,
              box-shadow 0.2s ease;
}
```

## Repo conventions to follow

- High-performance UI uses `cubic-bezier(0.16, 1, 0.3, 1)` for transforms.
- Color and border shifts use `ease` or match the transform duration.

## Steps

1. Edit `app/contractacio/contractacio.css:106`: replace `transition: all 0.2s ...` on `.contract-quick-pill` with targeted properties.
2. Edit `app/contractacio/contractacio.css:204`: replace `transition: all 0.3s ...` on `.contract-format-card` with targeted properties.
3. Edit `app/contractacio/contractacio.css:340`: replace `transition: all 0.2s ...` on `.contract-card-btn` with targeted properties.
4. Edit `app/contractacio/contractacio.css:388`: replace `transition: all 0.25s ...` on `.contract-doc-card` with targeted properties.
5. Edit `app/contractacio/contractacio.css:444`: replace `transition: all 0.2s ...` on `.contract-doc-download-btn` with targeted properties.
6. Edit `app/contractacio/contractacio.css:591`: replace `transition: all 0.2s ...` on `.contract-modal-close` with targeted properties.
7. Edit `app/contractacio/contractacio.css:724`: replace `transition: all 0.25s ...` on `.contract-submit-btn` with targeted properties.

## Boundaries

- Do NOT change dimensions, paddings, fonts, margins, or visual colors.
- Do NOT touch layout structures or flex/grid definitions.

## Verification

- **Mechanical**: Run `npm run build` to verify clean build.
- **Feel check**:
  - In DevTools Performance panel, record hovering rapidly over cards and pills.
  - Verify that paint count and recalculate style bursts are reduced.
  - Check that hover animations remain silky smooth without any stutter.
- **Done when**: Zero occurrences of `transition: all` remain in `app/contractacio/contractacio.css`.
