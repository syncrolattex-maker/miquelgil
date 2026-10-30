# A24 — Films

## Mission
Create implementation-ready, token-driven UI guidance for A24 — Films that is optimized for consistency, accessibility, and fast delivery across documentation site and interactive surfaces.

## Brand
- Product/brand: A24 — Films
- URL: https://a24.raviklaassens.com/
- Audience: developers, designers, and cultural curators
- Product surface: documentation site & interactive physical media archive

---

<!-- TYPEUI_SH_MANAGED_START -->

# A24 — Films

## Mission
Deliver implementation-ready design-system guidance for A24 — Films that can be applied consistently across documentation site interfaces.

## Brand
- Product/brand: A24 — Films
- URL: https://a24.raviklaassens.com/
- Audience: developers and technical teams
- Product surface: documentation site

## Style Foundations
- Visual style: structured, accessible, implementation-first, minimal monochrome
- Main font style: `font.family.primary=Ppneuemontreal`, `font.family.stack=Ppneuemontreal, PP Neue Montreal, Arial, sans-serif`, `font.size.base=16px`, `font.weight.base=500`, `font.lineHeight.base=22.4px`
- Display & Editorial fonts: `font.family.display=PP Museum`, `font.family.editorial=PP Eiko`
- Typography scale: `font.size.xs=10px`, `font.size.sm=16px`, `font.size.md=18px`, `font.size.lg=28px`, `font.size.xl=40px`, `font.size.2xl=160px`
- Color palette: `color.text.primary=#000000`, `color.surface.muted=#f2f2f2`, `color.surface.pure=#ffffff`, `color.surface.dark=#000000`, `color.text.secondary=#888888`
- Spacing scale: `space.1=8px`, `space.2=16px`, `space.3=24px`, `space.4=32px`, `space.5=48px`, `space.6=64px`
- Radius/shadow/motion tokens: `radius.xs=4px`, `radius.pill=30px` | `motion.duration.instant=200ms`, `motion.duration.fast=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required (`outline: 2px solid #000000; outline-offset: 3px;`).
- Contrast constraints required (minimum 4.5:1 for body text, 3:1 for large display).

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.
- Do not use `transition: all`.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (32), buttons (5), inputs (1), navigation (1), lists (1).

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
