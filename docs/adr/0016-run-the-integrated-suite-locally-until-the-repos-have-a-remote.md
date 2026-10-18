# ADR-0016 — Run the integrated suite locally until the repos have a remote

- **Status:** Accepted — failing on a missing seed variable superseded by ADR-0027
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

ADR-0012 promised a CI job for the integrated suite, added with the auth slice. Neither repository
has a remote, so no CI runs at all. The suite needs the Java API, PostgreSQL, seed data and JWT
keys from foody-api: a job written now would never execute and would read as protection that does
not exist.

## Decision

- The integrated suite runs locally with `npm run e2e:integrated`
  (`playwright.integrated.config.ts`): specs in `e2e/integrated/`, one Desktop Chrome project at
  1280px, its own Vite on port 4174 pointed at `http://localhost:8080`, never reusing a running
  server, and no `storageState` — every spec logs in.
- Credentials come from the variables the API's seed reads — `SEED_CUSTOMER_EMAIL`,
  `SEED_STAFF_EMAIL`, `SEED_DEFAULT_PASSWORD` — and the config fails before starting anything when
  one is missing.
- How to run it: `./mvnw spring-boot:test-run` in `../foody-api`, then
  `set -a; . ../foody-api/.env; set +a; npm run e2e:integrated`. A slice that changes a critical
  flow runs it before hand-off.
- No CI job until the repositories have a remote. This supersedes only ADR-0012's promise of that
  job; the rest of ADR-0012 stands.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Add the CI job now | It cannot run without a remote; a green badge that never ran is worse than none |
| Run against `docker compose up` | The deploy image has no seed data and no seed accounts |
| A shared `storageState` | Sessions rotate on every refresh; reusing one couples specs and trips reuse detection |
| Credentials written in the spec | They would drift from the API's `.env` and land in git |

## Pros

- Front and API are proven to work together on the critical flows, with the real seed.
- Nothing new to install: Playwright and the API's own `test-run`.

## Cons

- Nothing enforces it: someone has to remember to run it.
- Port 4174 must stay in the API's allowed CORS origins.
- A change to the seed accounts breaks it until the `.env` values are updated.
- Revisit as soon as a remote exists: the job ADR-0012 described comes back.
