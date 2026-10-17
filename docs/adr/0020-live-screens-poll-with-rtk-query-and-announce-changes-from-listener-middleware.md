# ADR-0020 — Live screens poll with RTK Query and announce changes from listener middleware

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

Orders change after the screen that shows them was rendered: the kitchen moves an order along, a
customer places a new one. Three screens must follow those changes without a reload — the staff
board, the customer's tracking of an order that is still live, and the staff detail of a live
order — and staff must notice a new order even while looking at another column. foody-api has no
push channel (no WebSocket, no Server-Sent Events), there is a single restaurant, and the SPA is
served behind nginx with a Content-Security-Policy that lists the API origin for `connect-src`
only (ADR-0017). RTK Query already owns every request (ADR-0002) and RTK listener middleware
already owns side effects triggered by actions (ADR-0014).

## Decision

- **Only live screens poll, every 30 s, and never while the window is hidden.** The board polls
  always; the tracking and the staff detail poll while the order's `live` is `true` and stop as soon
  as the API says it is not. Each passes `livePolling(live)` (`src/utils/live-polling.ts`) —
  `pollingInterval` from `LIVE_ORDER_POLLING_MS` and `skipPollingIfUnfocused: true` — to the query
  hook. The board is one request (`getOrderBoard`: the three active statuses, 100 orders, oldest
  first) split by status in the client.
- **"Recarregar" ends in `invalidateTags`** through `useReload` (`src/hooks/use-reload.ts`), never a
  component `refetch()` (ADR-0006). "Atualizado há N s" reads the query's `fulfilledTimeStamp`;
  ages and that label tick through `useNow` (`useSyncExternalStore`, no effect timers).
- **Announcements come from a listener, not from components.** `src/store/listeners/orders.ts`
  runs on every fulfilled board result, compares it with the previous result of the same cache key
  (`getOriginalState`), and toasts each `RECEIVED` order that was not there before. The first load
  announces nothing, and an order that only changed status is not announced again.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| WebSocket or Server-Sent Events | The API has no push endpoint; it would need a broker-less fan-out on the server, sticky connections through the proxy and a CSP/nginx change, for one restaurant and three screens |
| Poll every screen that shows an order | Lists and history do not need to move under the user; polling them multiplies requests for nothing |
| Diff results in the board component (`useEffect` on `data`) | An effect for data logic (R7); StrictMode runs it twice, and remounting the board would re-announce everything |
| `refetch()` in a `setInterval` | Re-implements what `pollingInterval` already does, and keeps polling in background tabs |

## Pros

- No new infrastructure, protocol or dependency: the cache, tags and error handling stay the same.
- A screen that is not mounted, or a tab that is hidden, costs nothing.
- One place decides what is "new"; it is unit-tested without rendering anything.

## Cons

- Up to 30 s between a change in the API and the screen showing it.
- Every open live screen costs one request per 30 s; many staff tabs multiply the load, and the
  rate limit (foody-api ADR-0017) must stay above it.
- An order that arrives and leaves `RECEIVED` between two polls — or while polls are skipped
  because the window is hidden — is never announced; the board itself still shows the right state,
  which is accepted.
- A board beyond 100 active orders shows only the oldest 100.
- Revisit when the API gains a push channel or a second restaurant: this decision is then reopened.
