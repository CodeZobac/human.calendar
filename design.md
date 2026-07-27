# Design — Human Cycles

A locked design system for the full app. Extend this system; do not regenerate a different theme per view.

## Genre

Atmospheric: a cinematic celestial instrument whose readings remain the visual priority.

## Macrostructure family

- App views: Map / Diagram. One dominant spatial instrument with a quieter readout or legend rail.
- Today: asymmetric constellation board around one primary orbit.
- Compare: two balanced readings joined by one orbital axis.

## Theme

Custom tuned cosmic blue/violet. Dark mode uses deep navy papers and luminous violet atmosphere; light mode uses pale celestial blue papers and dark violet signals. Cycle colours appear only when they encode data.

## Typography

- Display: Cormorant Garamond, roman, weight 600.
- Body: Manrope, weights 400 and 700.
- All numeric readings use tabular figures.

## Spacing

4-point named scale in `tokens.css`; production CSS consumes named tokens.

## Motion

- Tab content: opacity crossfade.
- Functional dial/progress changes: transform and opacity only.
- Controls: brief press feedback.
- Reduced motion: opacity-only, no more than 150 ms.

## Navigation and footer

- Desktop: N5 content-sized floating pill, solid instrument surface.
- Mobile: accessible bottom tab dock respecting safe areas.
- Footer: Ft2 single-line epoch/calendar metadata; vertical collapse on narrow screens.

## Surface and atmosphere

Opaque elevated instrument surfaces, sparse orbital rules, static star field, and two localized static nebulae. No glassmorphism, looping decorative motion, external imagery, or broad fade-up sequence.

## What views must share

Semantic tokens, fonts, focus ring, control states, opaque surfaces, diagram/readout split, mobile collapse, and theme persistence through `localStorage["theme"]`.

## Exports

`tokens.css` is the canonical export. Tailwind, DTCG, and shadcn mappings are direct role-for-role translations of its semantic colour, type, spacing, motion, rule, and radius tokens.
