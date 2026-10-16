# ADR-0007 — The sidebar and screen access come from GET /me

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

The app is split into areas and screens (ADR-0005), and each user reaches only some of them. A
menu defined in the front and filtered by roles puts the access rules in two places — the API
that authorizes requests and the front that decides what to show — and the two drift: the menu
offers screens the API refuses, and every rename or reorder needs a front deploy. foody-api's
ADR-0001 makes `GET /me` the single answer to "what can this user reach".

## Decision

The sidebar renders the `modules` and `screens` of `GET /me`, in the order and with the labels it
returns. The front owns only what must be code: each `<screen>.routes.ts` declares its screen key
and icon in the route's `handle`, each `<area>.routes.ts` its module key and icon. The sidebar
joins `/me` with the route table by key and skips keys that have no route. The same response
guards navigation — a URL to a screen absent from `/me` renders the forbidden page — and
`useCan(screenKey, action)` decides which actions a screen offers. `/me` lives only in the RTK
Query cache and is reset on logout (ADR-0006).

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Menu defined in the front, filtered by the user's roles | Access rules in two places that drift; renaming or reordering needs a front deploy |
| `/me` also returns paths and icon names | Routes must be known to the bundle at build time; icon names would tie the API to the icon library |
| Role checks in components (`role === "ADMIN"`) | Each screen re-implements the role → permission mapping; a new role means changes everywhere |
| A copy of `/me` in `localStorage` as fallback | A second, stale source of truth that outlives permission changes and logouts |

## Pros

- Permissions change in one place, the API, and the menu follows without a front deploy.
- The front never learns about modules or screens the user cannot use.
- Sidebar, route guard and action buttons agree, because they read the same response.

## Cons

- Hiding in the front is UX, not security: every API endpoint still authorizes on its own.
- Screen keys are a cross-repo contract; a renamed key drops the item until both sides change.
- A screen whose route is not deployed yet is skipped without notice.
- A permission change reaches an open session only when `/me` is fetched again.
- Sidebar labels are API data, not entries in `src/constants/messages.ts`.
