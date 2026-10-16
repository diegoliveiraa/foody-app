# ADR-0002 — Fetch server data with RTK Query

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

`CLAUDE.md` R5 requires server data to come from a data layer in `src/services/*`, one file per
domain, and left the library open until the first API call. The app consumes `foody-api` only.
Without a library, every screen reimplements loading, error handling, caching and invalidation —
differently each time, with requests fired twice and lists out of sync after a write.

## Decision

Every request to the API goes through RTK Query: one `createApi` base in `src/services/` using
`fetchBaseQuery` with `VITE_API_URL`, and one `injectEndpoints` file per domain in
`src/services/<domain>.ts`. Components use the generated hooks. Global client state, when needed,
is a slice in the same Redux store. Request errors go through one extractor in `src/utils`.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| TanStack Query | Fits server state well, but global client state would need a second tool and a second source of truth |
| `fetch`/`axios` in custom hooks | Reimplements caching, deduplication and invalidation by hand |
| SWR | Weaker story for mutations and cache invalidation |

## Pros

- Caching, request deduplication and tag-based invalidation without hand-written code.
- Typed hooks generated per endpoint.
- Server cache and client state in one store, inspectable with Redux DevTools.

## Cons

- Redux setup (store, `Provider`) even while there is little or no client state.
- Heavier than TanStack Query if the app ends up holding server state only.
- Invalidation tags must be designed per domain; a wrong tag means stale screens.
- No `axios`: interceptors are written as a `baseQuery` wrapper instead.
