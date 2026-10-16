# ADR-0001 — Build the UI with Tailwind CSS and shadcn/ui on Radix

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

The app had no UI layer beyond the Vite starter, while `CLAUDE.md` already requires UI primitives
in `src/components/ui/` (R4) and accessible interactive components (R13). Without a decision,
each screen picks its own styling approach and icon set — and a second styling system, once a few
screens depend on it, is never removed.

## Decision

Styling is Tailwind CSS 4 through `@tailwindcss/vite`, with the shadcn theme tokens in
`src/index.css`. Primitives come from shadcn (Radix base, `nova` preset), added with
`npx shadcn add <name>` into `src/components/ui/`. Class names are merged with `cn` from the `cn`
package. Icons come only from `lucide-react`. No CSS-in-JS, no component kit, no second icon set.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| styled-components / Emotion | Styles computed at runtime, and a second way of styling next to utility classes |
| Chakra UI / MUI | A component kit we don't own, whose theming competes with Tailwind instead of using it |
| `clsx` + `tailwind-merge` | Same result, but the current shadcn CLI rewrites them into `cn` on every `add` |
| `react-icons` | Many icon sets with different visual styles; shadcn components are drawn with Lucide |

## Pros

- Primitives are source code in the repo: we change them instead of overriding a library.
- Radix provides focus, keyboard and ARIA behaviour, which covers most of R13.
- One styling system and one icon set: no screen has to guess which one applies.

## Cons

- A generated component does not meet our rules as is: every `add` needs explicit types (R15),
  its `cva` variants moved to a sibling file (oxlint's `only-export-components` warns otherwise)
  and its comments stripped (R14).
- `cn` is a 0.x package; `src/test/cn.test.ts` pins the two behaviours we rely on.
- `src/index.css` imports `shadcn/tailwind.css`, so the `shadcn` CLI is a devDependency. It brings
  7 high-severity `npm audit` findings (`braces` via `ts-morph`) — dev only,
  `npm audit --omit=dev` is clean.
- The `nova` preset adds the Geist font as a dependency.
