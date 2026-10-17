# ADR-0014 — One shell per area and public pages outside /me

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

ADR-0005 fixed areas and screens and ADR-0007 made `GET /me` the source of navigation, but neither
said how a screen is framed. Customers order from a phone; staff run the store from a counter
tablet or a desktop — one frame does not serve both. Login and sign-up cannot come from `/me`,
because nobody is signed in yet, and the app needs forbidden and not-found pages. Restoring the
session on load must run exactly once: a second refresh with the same cookie trips the API's reuse
detection (foody-api ADR-0002), and React's StrictMode runs effects twice in development. This ADR
extends ADR-0005 and ADR-0007; both still hold.

## Decision

- **The shell is chosen by the route's area, never by the user's role.** Each `<area>.routes.ts`
  lazy-loads its layout from `src/components/`: `store-layout` for `store` (bottom tabs and a
  "Conta" bottom sheet below 768px, a top bar with an account menu above), `backoffice-layout` for
  `dashboard`, `orders`, `catalog` and `admin` (the shadcn Sidebar, one group per `/me` module,
  off-canvas behind the page header's menu button on phones), `auth-layout` for `auth`.
- **Public pages** live in `src/pages/auth/{login,register}/` and carry `handle: { public: true }`
  instead of a screen key. **Error pages** live in `src/pages/errors/`: `forbidden` (a screen loader
  throws 403), `not-found` (the `*` route) and `unexpected` (any other loader failure).
- **Bootstrap and guards are React Router loaders** in `src/routes/guards.ts`, attached from the
  handles by `guardRoutes` — never written per route. The root loader restores the session once
  per store (refresh when there is no token, then `/me` through the store); a screen redirects a
  signed-out visitor to `/login?redirectTo=<path>` and throws 403 when `/me` lacks its key; a public
  page sends a signed-in user home; `/` goes to the first routed screen of the first `/me` module.
  Loaders reach the store through the router context.
- **Screen paths are derived from the route table** (`src/routes/navigation.ts`), never from a
  second map. View folders may also be `detail/`, `checkout/`, `board/` and `history/`.
- **Side effects triggered by actions live in RTK listener middleware**, one file per concern in
  `src/store/listeners/`: the token after login or sign-up, logout, an expired session, the 429
  toast. The store gets `navigate` as a listener dependency.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| One layout chosen by the user's role | A role check in the front (R18), and the role is not in `/me` |
| Public pages listed in `/me` | `/me` needs a signed-in caller |
| Guards as components with `useEffect` or `<Navigate>` | Double refresh under StrictMode; protected content flashes before the redirect |
| A hand-written loader per screen | The key is written twice per route, and a forgotten guard leaves a screen open |
| Navigation and logout in components | Ordering (leave the page, then reset the cache) repeated in every caller |

## Pros

- One loader decides access before anything renders; a screen cannot ship without its guard.
- Phone and desktop users get a frame built for their job, from the same `/me`.
- Restoring a session costs one refresh per page load, however many loaders wait for it.

## Cons

- A customer who types a back-office URL sees the back-office shell around the forbidden page.
- Each navigation dispatches `/me`; it is a cache hit, so a permission change still needs a refetch.
- React Router 8 caches lazy route properties per `lazy` object at module level: two routers built
  from the same table misbehave, so tests give each memory router fresh `lazy` objects.
- The store is created before the router, so `main.tsx` hands the listeners a `navigate` that
  closes over the router.
