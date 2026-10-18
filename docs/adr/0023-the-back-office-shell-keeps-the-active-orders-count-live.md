# ADR-0023 — The back-office shell keeps the active-orders count live

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

Staff should see how many orders are active from any back-office page, next to "Pedidos" in the
sidebar (the approved desktop prototype), and hear about a new order wherever they are. ADR-0020 let
only live screens poll — the board, the tracking and the staff detail. The board's single request
(`getOrderBoard`: the three active statuses, 100 orders) already answers `meta.totalItems`. Below
768px the sidebar is an off-canvas sheet that is unmounted while closed, so nothing inside it can
own a poll. The dashboard, shipped with this decision, must also refresh on its own.

## Decision

- `BackofficeLayout` keeps the board live (`useLiveActiveOrders`): it subscribes to `getOrderBoard`
  with the same arguments the board uses — one cache entry, one request on the board page — polling
  every 30 s with `skipPollingIfUnfocused`, and skips the query when `/me` lacks `orders.order-list`.
  The layout is mounted on every back-office page and viewport, open menu or not.
- The sidebar only reads that entry. It attaches badges per `/me` screen key through one typed lookup
  (`screenBadgeFor`, `src/components/backoffice-layout/screen-badges.ts`); `orders.order-list` gets
  `ActiveOrdersBadge`, which reads `meta.totalItems` with `useQueryState` and never subscribes. It
  does not render at 0.
- The dashboard (`getDashboard`) polls every 60 s (`DASHBOARD_POLLING`), skipping hidden windows;
  "Recarregar" goes through `useReload` (ADR-0006).
- This partially supersedes ADR-0020: "only live screens poll" becomes "live screens, the dashboard
  and the back-office shell poll". The rest of ADR-0020 stands.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| A count endpoint | The API has none; a new contract for a number the board's answer already carries |
| The dashboard's `activeByStatus` | Exists only while the dashboard is open, refreshes every 60 s, and would disagree with the board |
| The badge subscribes itself | On phones the sheet unmounts it: no count and no toast until the menu opens |
| A second query with `pageSize=1` | A second request every 30 s beside the board's, and a second cache entry for order writes to refresh |

## Pros

- One request per 30 s per tab serves the board, the count and the toasts; order writes already
  invalidate it through the ORDER list tag.
- The same behaviour on every viewport: the count is ready when the menu opens, and the new-order
  toast (`src/store/listeners/orders.ts`) reaches staff on every back-office page.
- `totalItems` counts every active order, so the badge stays right beyond the board's 100.
- Users without the orders screen send no board request at all.

## Cons

- Every open back-office tab with the orders screen sends a board request (up to 100 orders) every
  30 s on every page, not only on the board; the rate limit (foody-api ADR-0017) must stay above it.
- The new-order toast also appears while staff edit a product or read the dashboard.
- The shell owns a data subscription that only one screen's badge displays; moving the badge or the
  board's arguments means keeping the two in step.
- The dashboard can lag a write made in another tab by up to 60 s; writes in the same tab
  invalidate `DASHBOARD` (ADR-0021).
- Every stubbed back-office E2E spec must answer the board request; `stubSession` does it for a `/me`
  with the orders screen, and history assertions ignore the shell's board query.
