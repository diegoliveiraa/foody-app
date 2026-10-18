# ADR-0018 — Lists render cards below 1024px and a data table from 1024px up

- **Status:** Accepted — "cards get no sort control" superseded by ADR-0025
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

The users screen is the first paginated list, and products, categories and the order history
follow with the same shape: search, filters, server-side sorting and pagination (R5). Staff use
them on a 320px phone as much as on a desktop (ADR-0014). A table at 320px either overflows or
hides most columns, while cards on a desktop waste the width and lose sorting by column header.
The back-office sidebar stays open from 768px, so between 768px and 1023px a list has about 450px
left — too narrow for a table with five columns and its actions. ADR-0015 switches layout in CSS
at 768px and lets JavaScript read a breakpoint only where a prop must change; a list is the case
where whole subtrees change, not a class.

## Decision

- Every list screen renders through `ResponsiveList` (`src/components/responsive-list`): below
  1024px a card list owned by the screen, from 1024px up `DataTable`
  (`src/components/data-table`). Only one of them is mounted. The breakpoint is
  `LIST_TABLE_BREAKPOINT_PX` in `src/constants/breakpoints.ts`, read through `useMediaQuery`; the
  shell keeps its own 768px breakpoint (`useIsMobile`, ADR-0015).
- `DataTable` is TanStack Table v9 on the shadcn `table`: the screen supplies `columns.tsx`, the
  rows and the current `SortOrder`; sortable headers are buttons that cycle ascending/descending
  and report the new order, which the screen sends as `sort=property,asc|desc`. Sorting is manual
  — the table never reorders rows. It shows skeleton rows while loading and the screen's empty
  state across the table.
- Both views share the screen's filter reducer, query, empty state, row-actions menu and
  `ListPagination` (`src/components/list-pagination`), which pages from `meta` and offers exactly
  the sizes in `src/constants/pagination.ts`.
- Cards get no sort control: they show the order last chosen, or the screen's default.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| A table everywhere, scrolling sideways | Unreadable at 320px; the row actions end up off-screen |
| Cards everywhere | No sorting by column, and desktop width goes to waste |
| Switch at 768px, the shell's breakpoint | With the sidebar open, 768px to 1023px leaves about 450px: the table scrolls sideways and hides its row actions |
| Render both and hide one with CSS (ADR-0015's default) | Every row, menu and id exists twice; tests and assistive tech see duplicates unless each copy is hidden, and large pages render twice |
| Hide table columns per breakpoint | Still a table on narrow screens, and visibility still needs JavaScript |

## Pros

- Each width gets a layout that fits it, from the same data, filters and pagination.
- One mounted view: selectors and accessible names stay unambiguous.
- `DataTable` and `ListPagination` are written once and reused by every list screen.

## Cons

- A second layout breakpoint next to ADR-0015's 768px: tablets in portrait see the desktop shell
  with cards inside it, and the 1024px value lives in JavaScript, not only in CSS.
- Layout is decided in JavaScript, an exception to ADR-0015's CSS-first rule; crossing 1024px
  remounts the view, closing open menus and dropping focus.
- Each list screen maintains two renderings of a row: its cards and its columns.
- Below 1024px the sort order cannot change unless a screen adds its own control.
- A table with more columns than the users screen can still need to scroll sideways at 1024px;
  its columns have to be chosen with that width in mind.
