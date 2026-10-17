# ADR — Architecture Decision Records

A short record of a **technical decision that constrains future code**. It answers "why is this
like this?" six months later, without PR archaeology.

## When to write one

Write one when the decision **closes a door**:

- A choice between alternatives with a real trade-off (library, protocol, caching strategy).
- A pattern that now applies to everyone (e.g. every request goes through one client).
- A structural change: new cross-cutting module, database swap, API contract break.
- A decision **not** to do something, when the question is likely to come back.

**Don't write one** for: an obvious choice with no alternative, an implementation detail of one
task, a bug fix, or a style rule — code rules live in `CLAUDE.md`.

Rule of thumb: if someone could legitimately redo this choice a year from now without knowing
what you knew, it's an ADR.

## How it works

- One file per decision in this folder, named `NNNN-title-in-kebab.md`, with the ID
  `ADR-NNNN`. Numbers are sequential and **never reused**.
- References — in test names, other docs, PRs — always use the full ID (`ADR-0004`), never the
  number alone.
- ADRs are written in **English**.
- An ADR is **immutable once accepted**. Changed your mind? Write a new one that supersedes it
  and mark the old one `Superseded by ADR-NNNN`.
- One page maximum. If it doesn't fit, the rest is documentation, not a decision.
- The file is **versioned alongside the code it decides** — same PR, not later.
- A new ADR is added to the index below.

## Format

```markdown
# ADR-NNNN — Imperative title stating the decision

- **Status:** Proposed | Accepted | Superseded by ADR-NNNN | Rejected
- **Date:** YYYY-MM-DD
- **Decided by:** name

## Context — why this became a decision
The problem and the real constraint, no solution yet: what hurt, what already
existed, what could not change. Two to five sentences.

## Decision
What now holds, in active voice: "Every X goes through Y". Specific enough that
someone can tell whether they are following it.

## Why this one and not the others
| Alternative | Why not |
If there was no real alternative, it probably isn't an ADR.

## Pros
What you gain, concretely. "It's cleaner" is not a gain; "one failing integration
does not take the others with it" is.

## Cons
What you lose and what becomes forbidden. **An ADR with no cons listed is
marketing, not a record** — if you found none, you didn't look. Include whatever
needs migration, rework or monitoring.
```

## Status

| Status | Meaning |
|---|---|
| `Proposed` | Written, still under discussion — not binding yet |
| `Accepted` | Binding. New code follows it |
| `Superseded by ADR-NNNN` | Replaced; kept in history, never deleted |
| `Rejected` | Discussed and turned down — the record prevents re-litigating it |

## Index

| ID | Date | Decision | Status |
|---|---|---|---|
| [ADR-0001](./0001-build-the-ui-with-tailwind-and-shadcn.md) | 2026-10-16 | Build the UI with Tailwind CSS and shadcn/ui on Radix | Accepted |
| [ADR-0002](./0002-fetch-server-data-with-rtk-query.md) | 2026-10-16 | Fetch server data with RTK Query | Accepted |
| [ADR-0003](./0003-build-forms-with-react-hook-form-and-zod.md) | 2026-10-16 | Build forms with React Hook Form and Zod | Accepted |
| [ADR-0004](./0004-route-with-react-router.md) | 2026-10-16 | Route with React Router in data mode | Accepted |
| [ADR-0005](./0005-organize-the-front-by-area-and-screen.md) | 2026-10-16 | Organize the front by area and screen | Accepted |
| [ADR-0006](./0006-invalidate-the-cache-by-entity-from-the-service.md) | 2026-10-16 | Invalidate the cache by entity and id, only from the service | Accepted |
| [ADR-0007](./0007-the-sidebar-and-screen-access-come-from-get-me.md) | 2026-10-16 | The sidebar and screen access come from GET /me | Accepted |
| [ADR-0008](./0008-keep-the-access-token-in-memory-and-refresh-it-in-the-base-query.md) | 2026-10-16 | Keep the access token in memory and refresh it in the base query | Accepted |
| [ADR-0009](./0009-serve-the-spa-from-unprivileged-nginx-and-run-the-api-locally-with-compose.md) | 2026-10-16 | Serve the SPA from unprivileged nginx; the local compose runs the API | Accepted — CSP decided in ADR-0017 |
| [ADR-0010](./0010-generate-the-api-types-from-its-openapi-contract.md) | 2026-10-16 | Generate the API's types from its OpenAPI contract | Accepted |
| [ADR-0011](./0011-enforce-the-code-rules-with-prettier-type-aware-lint-and-ci.md) | 2026-10-16 | Enforce the code rules with Prettier, type-aware lint and CI | Accepted |
| [ADR-0012](./0012-stub-the-network-in-tests-and-keep-an-integrated-suite-for-critical-flows.md) | 2026-10-16 | Stub the network in tests; keep an integrated suite for critical flows | Accepted — integrated CI job superseded by ADR-0016 |
| [ADR-0013](./0013-keep-dependencies-current-with-dependabot.md) | 2026-10-16 | Keep dependencies current with Dependabot | Accepted |
| [ADR-0014](./0014-one-shell-per-area-and-public-pages-outside-me.md) | 2026-10-17 | One shell per area and public pages outside /me | Accepted |
| [ADR-0015](./0015-visual-identity-mobile-first-and-sonner-toasts.md) | 2026-10-17 | Visual identity, mobile-first and Sonner toasts | Accepted |
| [ADR-0016](./0016-run-the-integrated-suite-locally-until-the-repos-have-a-remote.md) | 2026-10-17 | Run the integrated suite locally until the repos have a remote | Accepted |
| [ADR-0017](./0017-render-the-content-security-policy-at-build-time.md) | 2026-10-17 | Render the Content Security Policy at build time | Accepted |
| [ADR-0018](./0018-lists-render-cards-below-1024px-and-a-data-table-from-1024px-up.md) | 2026-10-17 | Lists render cards below 1024px and a data table from 1024px up | Accepted |
