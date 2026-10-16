# ADR-0010 — Generate the API's types from its OpenAPI contract

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

R17 puts the API's contract types in `src/@types`. Written by hand, they drift from the API
without a sound: TypeScript then checks the front against what someone typed, not against what the
API returns. foody-api publishes its contract as `docs/openapi.json` (foody-api ADR-0008).

## Decision

- `npm run api:types` generates `src/@types/api.d.ts` from `../foody-api/docs/openapi.json` with
  openapi-typescript, run through `npx` at a pinned version (7.13.0).
- The generated file is never edited and is exempt from R14.
- `src/@types/<domain>.d.ts` names what a domain uses —
  `export type Order = components["schemas"]["OrderResponse"];` — and services import from there.
- When the API's contract changes, the types are regenerated in the front change that uses them.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Hand-written types | Drift from the API silently |
| A generated client (orval, @hey-api/openapi-ts) | Generates request code that competes with RTK Query (ADR-0002) |
| RTK Query's OpenAPI codegen | One generated file for every endpoint, against one service per domain (R5) and the tag rules (ADR-0006) |
| openapi-typescript as a devDependency | Its peer is TypeScript 5 while the project runs 6; installing it would force the peer for the whole tree |

## Pros

- A contract change that breaks the front fails `tsc -b` instead of a screen in production.
- Types only: nothing reaches the bundle.

## Cons

- The generator comes through `npx`: its version is pinned in the script, not in the lockfile.
- It reads the contract from a foody-api clone beside this repo.
- When openapi-typescript supports TypeScript 6, it should move into `devDependencies`.
