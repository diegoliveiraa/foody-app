# ADR-0008 — Keep the access token in memory and refresh it in the base query

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

foody-api authenticates with 15-minute JWTs and rotating refresh tokens kept in an `HttpOnly`
cookie (foody-api ADR-0002). The front has to attach the access token to every request, renew it
without the user noticing, survive a page reload, and never let two tabs present the same refresh
token — the API's reuse detection would end the session.

## Decision

- The access token lives only in memory, in the session slice of the Redux store — never in
  `localStorage`, `sessionStorage` or a readable cookie. The refresh token is never visible to
  JavaScript.
- On load, the app calls `POST /auth/refresh`; the cookie goes along. Success restores the
  session; a 401 shows the login screen.
- The base query in `src/services/api.ts` wraps `fetchBaseQuery`: it adds `Authorization: Bearer`
  and, on a 401, refreshes once and retries the request once. Concurrent 401s share one refresh,
  and refreshes run under a Web Locks API lock, so two tabs never refresh at the same time.
- A failed refresh ends the session: token cleared, `resetApiState` (ADR-0006), back to login.
- Login, refresh and logout are endpoints in `src/services/auth.ts`, the only requests sent with
  `credentials: "include"`.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Access token in `localStorage` | Readable by any script on the page, and left behind on shared machines |
| axios interceptors | A second HTTP client next to RTK Query (ADR-0002) |
| Refresh on a timer before expiry | Fires for idle and hidden tabs; the 401 path is needed anyway |
| No cross-tab lock | Two tabs rotating the same token trip reuse detection and log the user out |
| A backend-for-frontend holding the tokens | One more server only to hide a token that scripts already cannot read |

## Pros

- A script injected in the page cannot take a long-lived credential: the refresh token is
  `HttpOnly` and the access token dies in 15 minutes.
- Expiry is invisible to the user: one refresh, one retry.
- Every request authenticates the same way, in one file.

## Cons

- Each page load spends one refresh request before the first data request.
- Requests made during a refresh wait for it.
- The Web Locks API needs a secure context (HTTPS or `localhost`).
- The retry path must be tested for expired, revoked and concurrent cases.
