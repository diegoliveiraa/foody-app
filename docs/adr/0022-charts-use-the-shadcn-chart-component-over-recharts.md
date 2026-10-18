# ADR-0022 — Charts use the shadcn chart component over Recharts

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

The dashboard shows orders per hour (today) or per day (7 and 30 days) from a series the API already
fills and buckets in the restaurant's zone (foody-api ADR-0025). It is the first chart in the app. It
must read on a 320px phone, use the theme tokens (ADR-0015), be accessible (R13) and stay inside the
Content-Security-Policy of ADR-0017. Primitives come from shadcn (ADR-0001), and shadcn ships a
`chart` component built on Recharts.

## Decision

- Charts are drawn with Recharts through `src/components/ui/chart.tsx`, added with
  `npx shadcn add chart` (`recharts` `^3.8.0`) and rewritten to our rules: explicit types, no
  comments, light theme only (the generated dark `THEMES` entry is gone). Colours come from tokens
  through `ChartConfig` (`var(--primary)` for the bars), never from hex values in a screen.
- A chart is used only from a lazy-loaded screen chunk. It sits inside `role="img"` with a label that
  names the series and the period, with Recharts' keyboard layer off (`accessibilityLayer={false}`),
  animations off, and the same points in a visually hidden table.
- The front plots the API's series as received; it only chooses which ticks to show and formats
  labels in the response's `timeZone`.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Hand-made CSS/SVG bars | Fine for a meter (the stage and cancellation bars are plain CSS), but axes, tick spacing, tooltips and resizing would be our code to keep, again for every future chart |
| Chart.js (react-chartjs-2) | Canvas: no DOM for Tailwind tokens, text invisible to assistive technology and to Playwright, theming through JavaScript options |
| visx / nivo | visx is low-level D3 bindings — we would still build the chart; nivo brings its own theming system and a larger footprint; neither has a shadcn wrapper |

## Pros

- The chart reads the same CSS variables as every other primitive; restyling the theme restyles it.
- Declarative SVG: bars, axis and tooltip in a few lines, and the DOM can be asserted in E2E.
- Screen-reader users get the numbers as a table instead of an unlabelled drawing.

## Cons

- Bundle: Recharts brings `victory-vendor` (d3), `es-toolkit`, `decimal.js-light`, `eventemitter3`
  and its own `immer` 10 and `reselect` 5.1.1 next to RTK's. The `overview` chunk is 317.69 kB
  (94.94 kB gzip); the entry chunk holds no Recharts code, so only the first dashboard visit pays it.
- Recharts writes inline `style` attributes and `ChartStyle` injects a `<style>` element: this works
  only while ADR-0017 keeps `style-src 'unsafe-inline'`.
- Its peer `react-is` resolves to 17.0.2, which does not recognise React 19 fragments: chart children
  must not be wrapped in fragments.
- Every `shadcn add chart` update means rewriting the generated file again.
- Inside `role="img"` the tooltip is pointer-only; keyboard users rely on the hidden table.
- jsdom cannot lay Recharts out: charts are verified in E2E only; unit tests cover the mapping.
