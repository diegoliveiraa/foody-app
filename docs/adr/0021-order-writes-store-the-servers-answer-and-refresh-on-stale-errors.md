# ADR-0021 — Order writes store the server's answer and refresh on stale errors

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

Staff advance, cancel and decide orders; customers cancel or ask to cancel them (foody-api
ADR-0024). Every one of those commands answers with the caller's full detail — the new status, the
action fields (`allowedTransitions`, `canCancel`, `canRequestCancellation`, `cancellationReasons`)
and the cancellation request. The screens that issue them poll (ADR-0020), so two people routinely
act on stale copies of the same order, and the API refuses with 422 (`INVALID_STATUS_TRANSITION`,
`CANCELLATION_NOT_ALLOWED`, `INVALID_CANCELLATION_REASON`, `PENDING_CANCELLATION_REQUEST`,
`CANCELLATION_ALREADY_REQUESTED`, `NO_PENDING_CANCELLATION_REQUEST`) or 409 `CONCURRENT_UPDATE`.
ADR-0006 lets only the mutation decide what refreshes; it did not say what to do with an answer
that already is the new state, nor with a refusal that means "your screen is out of date".

## Decision

- **On success**, the mutation stores its answer in the detail query for that id with
  `onQueryStarted` + `upsertQueryData` (`getOrder` for staff, `getMyOrder` for customers) and
  invalidates only what the answer does not cover: the ORDER list tag and `DASHBOARD`.
- **On a stale error** — the six lifecycle 422 codes and 409 `CONCURRENT_UPDATE`, detected by
  `code` (`STALE_ORDER_CODES`, `isStaleOrderError`) — `invalidatesTags` returns the item's
  `{ ORDER, id }` and the ORDER list, so the detail and the lists are read again; the caller shows
  the API's `detail` in a toast and closes its dialog (`useOrderFormSubmit`).
- **Any other error** invalidates nothing: a 400 maps onto the form's fields, the rest shows above
  the form. The tags come from one function, `orderWriteTags`, shared by both services.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Invalidate the item and refetch it | One more request for a state the answer already carries, and until it lands the old state shows its buttons enabled |
| Optimistic updates | The API owns the lifecycle rules; the front would guess the next action fields, and a rollback would contradict what the screen just showed |
| Refetch the order on every error | A validation 400 or a rate limit says nothing about the order's state; refetching would only cost requests |

## Pros

- The screen shows the new status and the next actions as soon as the command returns, with no
  window where a finished action is still offered.
- A stale screen corrects itself after one refusal: the user reads why and sees the real state.
- One function decides the tags for every order write, on both sides.

## Cons

- Two sources write the detail cache — the 30 s poll and the mutation; a poll that left before the
  command and lands after it could briefly show the older state until the next poll.
- `STALE_ORDER_CODES` must follow the API: a new lifecycle refusal code is a front change, or that
  refusal will not refresh the screen.
- `DASHBOARD` is invalidated before any query provides it, an exception to R5 until the dashboard
  screen ships.
- `onQueryStarted` now has two allowed uses (optimistic updates and storing the answer), which
  reviewers must tell apart from invalidating.
