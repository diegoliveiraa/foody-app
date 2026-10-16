# ADR-0005 — Organize the front by area and screen

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

Without an agreed layout, a front-end drifts the same way every time: one concern solved in
several shapes (filter state as a global slice in some screens, a local reducer in others), tests
in several folder conventions, each route declared in more than one place, folders with the same
role under different names (`hook/` and `hooks/`, `enum/` and `constants/`, `lib/` and `utils/`),
and shared pieces such as the data table re-implemented inside each screen. foody-app starts
empty and can fix one shape before the first screen exists.

## Decision

The tree in `CLAUDE.md` → "Folder layout" is the only layout. Code is grouped by area, then by
screen; a screen owns everything only it uses, and anything a second screen needs moves up to
`src/`. Each screen declares its route in `<screen>.routes.ts`, each area gathers its screens in
`<area>.routes.ts`, and `src/routes/index.tsx` builds the one router. Filter state is a
`useReducer` in the screen's `filter/`. Tests sit beside the file. Names are kebab-case.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Feature-Sliced Design (`entities/`, `features/`, `widgets/`) | A vocabulary of its own to learn before placing a single file |
| Layer-first (all components in `src/components`, all hooks in `src/hooks`) | A screen spreads across the whole tree; deleting one leaves orphans behind |
| Filter state as a Redux slice per screen | Each screen registers a reducer in a global file, and its state outlives the screen by default |
| Tests in `__tests__/` | One more folder at every level of the tree |
| Route registry in a `config/` folder plus nested `<Routes>` per area and screen | Three files to touch per route, in the declarative style ADR-0004 left behind |

## Pros

- A screen is read, moved or deleted as one folder.
- One place per kind of file: "where does this go?" stops being a review comment.
- Area → screen is the shape most React SPAs already use, so the tree reads without a guide.

## Cons

- Deeper paths (`pages/<area>/<screen>/components/…`) and two routes files per screen and area.
- A filter kept in `useReducer` resets when the user leaves the screen; keeping it means
  promoting it to a store slice.
- Promoting shared code means moving files and rewriting imports in the screens that use them.
- Screen-level message catalogs can drift into duplicates; R3 moves a message to
  `src/constants/messages.ts` as soon as a second screen needs it.
