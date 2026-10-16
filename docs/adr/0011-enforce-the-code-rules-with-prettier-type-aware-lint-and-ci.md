# ADR-0011 — Enforce the code rules with Prettier, type-aware lint and CI

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

`CLAUDE.md` holds rules (R1–R19) that only held as long as someone remembered a `grep` before
handing off, and the code had no formatter at all. Several rules — no `any`, no `console`, no
floating promises, explicit return types — are exactly what a linter checks better than a person.

## Decision

- **Format:** Prettier (`printWidth` 100; Markdown and generated files excluded), `npm run format`
  to apply, `npm run format:check` to verify.
- **Lint:** oxlint, type-aware through `oxlint-tsgolint`, failing on any warning
  (`--deny-warnings`). Rules: R8 `no-explicit-any`, R10 `no-console`, R11 `no-floating-promises`
  and `no-misused-promises`, R15 `explicit-function-return-type`, R1 `no-nested-ternary` and
  `no-else-return`, plus `jsx-key`, `eqeqeq`, `prefer-const` and `no-var`.
- **Comments (R14):** `npm run check:comments` checks every `.ts`/`.tsx`, ignoring string and
  template literals, except the generated `src/@types/api.d.ts`.
- **CI** (GitHub Actions) on pushes to `main`/`develop` and on pull requests: `tsc -b`, lint,
  format check, comment check, unit tests and build, then the image built and the web container
  brought up until healthy.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| oxfmt | Still 0.x; Prettier is the stable reference it aims to match |
| ESLint with typescript-eslint | A second linter next to oxlint, many times slower, for rules oxlint now covers |
| Lint without types | Cannot see a floating promise — the bug R11 exists for |

## Pros

- Most of R1, R8, R10, R11 and R15 fail the build instead of waiting for review.
- Formatting never shows up in a diff again.
- The image is proven to serve on every change.

## Cons

- `oxlint-tsgolint` builds on the native TypeScript compiler, newer than the project's TypeScript 6;
  a disagreement between the two would surface as lint noise.
- R3 (literals) and R17 (where types live) are still checked in review — no rule expresses them.
- The `switch` ban (R1) has no oxlint rule and stays a review item.
- E2E joins CI with the first Playwright spec; CI needs a GitHub remote to run.
