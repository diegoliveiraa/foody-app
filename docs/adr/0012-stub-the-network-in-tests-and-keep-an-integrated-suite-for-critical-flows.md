# ADR-0012 — Stub the network in tests; keep an integrated suite for critical flows

- **Status:** Accepted — integrated CI job superseded by ADR-0016
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

Every screen ships with an E2E spec (standing rule 7) and every hook or service with unit tests
(R6), and both talk to the API. A test that reaches a real backend is slow, depends on data someone
else changed and fails for reasons unrelated to the screen; a test that mocks everything never
proves front and API work together. And a test that silently reaches the network — because one call
was not mocked — is the worst of both.

## Decision

- **Unit and integration tests (Vitest):** MSW 3 intercepts every request (`src/test/server.ts`),
  with `onUnhandledFrame: "error"`, so an unanswered request fails the test. Each test declares its
  answers in its Arrange; the API origin is fixed at `http://api.test`.
- **E2E (Playwright), by default stubbed:** specs in `e2e/tests/` run against their own Vite on port
  4173 with the API pointed at a fake origin; the auto fixture `api` aborts and reports any call
  without an `api.respond(...)` stub. Every spec runs at 320, 768, 1280 and 1536 px. CI runs them
  on every change.
- **Integrated E2E for critical flows only:** login and the main CRUD also run in `e2e/integrated/`,
  against the real API with seed data (foody-api ADR-0007). It starts with the auth slice.
- Selectors are what a user perceives — role, label, text; `data-testid` only as a last resort.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Only stubbed E2E | The front and the API are never proven to work together before production |
| Only E2E against the real API | Slow, stateful and needs the Java backend in the front's CI for every screen |
| MSW in the browser for E2E | Needs worker code in the app's bootstrap; Playwright's routing intercepts without touching the app |
| Mocks that let unknown requests through | A missed stub becomes a silent call to a real server |

## Pros

- Stubbed specs are fast and deterministic: a failure points at the screen, not at data.
- Error and empty states are as easy to test as the happy path — they are just another answer.
- A missed stub fails loudly, in unit tests and in E2E alike.
- The integrated suite proves the critical paths end to end without paying that price everywhere.

## Cons

- Stubs can drift from the API; typing them with the generated types (ADR-0010) narrows the gap,
  the integrated suite closes it only for critical flows.
- Every spec runs four times, once per viewport.
- The integrated suite needs the API, PostgreSQL and seed data running — a heavier CI job, added
  with the auth slice.
