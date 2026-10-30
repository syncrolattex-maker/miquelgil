---
name: design-system-a24-films
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

# A24 — Films Design System

## Mission
Deliver implementation-ready design-system guidance for A24 — Films and inspired projects that can be applied consistently across digital and documentation interfaces.

## Brand Context
- **Product/brand**: A24 — Films / Miquel Gil Arxiu Sonor
- **Reference URL**: `https://a24.raviklaassens.com/`
- **Audience**: Developers, designers, cultural curators, and technical teams
- **Product surface**: Interactive archive, catalogue, documentation site

## Style Foundations
- **Visual style**: Structured, accessible, physical-tribute, implementation-first
- **Main font stack**: `font.family.primary=PP Neue Montreal, Ppneuemontreal, Arial, sans-serif` (`PPNeueMontreal-Medium.woff2`), `font.size.base=16px`, `font.weight.base=500`, `font.lineHeight.base=22.4px`
- **Editorial font stack**: `font.family.editorial=PP Eiko, GRIFINITO L, Georgia, serif` (`PPEiko-Regular.woff2`)
- **Archive font stack**: `font.family.archive=PP Museum, serif` (`PPMuseum-Regular.woff2`)
- **Monumental display**: `font.family.display=Maelstrom Sans, sans-serif`
- **Typography scale**: `font.size.xs=10px`, `font.size.sm=16px`, `font.size.md=18px`, `font.size.lg=28px`, `font.size.xl=40px`, `font.size.2xl=160px`
- **Color palette**: `color.text.primary=#000000`, `color.surface.muted=#f2f2f2`, `color.accent.visceral=#E20000`
- **Spacing scale**: `space.1=8px`, `space.2=16px`, `space.3=24px`, `space.4=32px`
- **Radius / motion tokens**: `radius.xs=4px`, `radius.pill=30px` | `motion.duration.instant=160ms`, `motion.duration.fast=300ms`, `motion.ease.out=cubic-bezier(0.16, 1, 0.3, 1)`

## Accessibility
- **Target**: WCAG 2.2 AA
- **Keyboard-first interactions**: Required (`Tab`, `Space`, `Enter`, `1-3`, `M`).
- **Focus-visible rules**: High-contrast indicator required (`outline: 2px solid #E20000; outline-offset: 3px`).
- **Contrast constraints**: Required ($\ge 4.5:1$ for body, $\ge 3:1$ for large display).

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not use `transition: all` or unconstrained layout animations.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions across the 7 required states.
4. Add accessibility acceptance criteria with testable pass/fail conditions.
5. Add anti-patterns and prohibited implementations.
6. End with a QA checklist.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.
