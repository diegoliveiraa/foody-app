# ADR-0006 — Invalidate the cache by entity and id, only from the service

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

With RTK Query (ADR-0002) a screen is only as fresh as its cache tags describe the data, and tags
are where RTK Query code usually goes wrong. A fixed tag per type makes every edit refetch every
list and detail of that type, so heavy endpoints pay again on each refresh. Tags named after
query shapes (`ONE_X`, `ALL_X`) must be invalidated in pairs. Tags get declared and never
provided. And once nobody trusts the tags, components start calling `refetch()` after mutations
and dispatching `invalidateTags` themselves — what a write changes stops being readable anywhere.

## Decision

Tag types are declared once, in `src/services/cache-tags.ts`, one per backend resource. A list
query provides `{ type, id: LIST_ID }` plus one `{ type, id }` per item; a detail query provides
its item. A mutation invalidates the narrowest tags it changes, in its own `invalidatesTags` —
other domains' tags included. Components never `refetch()` nor invalidate after a mutation; the
one manual path is a "reload" hook that also ends in `invalidateTags`. Logout resets the API
state.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| One tag per type, invalidated whole | Every edit refetches every subscribed list and detail of that type |
| Tags per query shape (`ONE_X` / `ALL_X`) | Two names for one entity; forgetting one leaves a screen stale |
| `refetch()` in the component after the mutation | Only that screen refreshes, and what a write changes is no longer readable in the service |
| Optimistic updates (`updateQueryData`) everywhere | More code and rollback paths; kept for interactions where latency hurts |

## Pros

- An edit refetches only the queries showing that record, and only while they are mounted.
- What a write changes is read in one place: the mutation's `invalidatesTags`.
- Every screen showing the record refreshes, not just the one that wrote it.

## Cons

- List queries need function-form `providesTags` and item ids in every list response.
- A mutation with side effects in other domains keeps that tag list by hand, in step with the API.
- Invalidating `LIST_ID` refetches every cached page of a paginated list.
- No TypeScript `enum` for the tags (`erasableSyntaxOnly`): a const object plus a derived type.
