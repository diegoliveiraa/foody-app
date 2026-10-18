# ADR-0025 — Card lists sort through one shared select

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

ADR-0018 renders lists as cards below 1024px and as a `DataTable` from 1024px up, and decided that
cards get no sort control: below 1024px the history, products and users lists could only show the
order last chosen in a table, or the default. Staff on phones and portrait tablets need the same
sorts as on a desktop — newest or oldest orders, the most expensive products. The server already
sorts every list (`sort=property,asc|desc`, R5) and each screen's filter state already holds a
`SortOrder` that the table headers change.

## Decision

- Every card list offers one "Ordenar por" select, `SortSelect` (`src/components/sort-select`),
  rendered inside the `cards` slot of `ResponsiveList`, so it exists only below
  `LIST_TABLE_BREAKPOINT_PX` and never next to a table.
- Each screen declares its options once in `constants/index.ts` as `SortOption[]`
  (`src/utils/sort-options.ts`): a plain-words label ("Mais recentes", "Menor preço", "Nome (A–Z)")
  and the `SortOrder` it stands for — the same properties the table headers sort, with the
  direction in words. Labels shared by screens live in `MESSAGES.SORT_OPTIONS`.
- The select drives the same filter action as the headers (`changeSort`), so the same page-reset
  rule applies. A sort with no matching option (set from a table header, then the window narrowed)
  shows the placeholder.
- This supersedes ADR-0018's "Cards get no sort control"; the rest of ADR-0018 stands.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Keep cards unsortable (ADR-0018) | Staff on phones cannot see the oldest orders or the most expensive products first |
| Two controls, a field select and an asc/desc toggle | Two taps and a direction icon to decode, for lists with four to six meaningful orders |
| A sort control in each screen's toolbar at every width | A second sort control next to the table's headers, which can disagree on what is active |
| Sort the loaded cards in the browser | Only one page is loaded; the order must come from the API (R5) |

## Pros

- Every width can reach the same sorts, written once per screen next to the columns.
- One component, one mapping to `sort=property,direction`, the same reducer path as the headers.
- Options read as the user thinks ("Mais antigos"), not as a property name plus an arrow.

## Cons

- Each screen keeps a third description of its sortable fields (columns, cards, sort options) that
  must stay in step with the API's sortable properties.
- Directions not listed (for example products "oldest first") stay reachable only from the table.
- The select takes a row above the cards on narrow screens.
