# ADR-0028 — Dependabot targets develop and leaves platform majors to planned upgrades

- **Status:** Accepted
- **Date:** 2026-10-18
- **Decided by:** Diego

## Context — why this became a decision

ADR-0013 set Dependabot to propose every update weekly, majors included, as pull requests. When the
repository reached GitHub, its first run opened pull requests against `main` for the `node` build
image (24 → 26) and `@types/node` (24 → 26), while CI and the README run Node 24. `main` and
`develop` now accept changes only through pull requests with green CI, and changes reach `main`
through `develop`. A Node major is a platform decision that touches the Dockerfile, CI, the README
and the Node types together, never a routine bump.

## Decision

- Every Dependabot update targets **`develop`** (`target-branch: develop`), like any other change.
- **Platform majors are ignored:** the `node` image and `@types/node`, which follows the Node version
  in use. Their minor and patch updates still arrive.
- Majors of libraries (npm) and of GitHub Actions still arrive as pull requests, to be judged on
  their own. Everything else in ADR-0013 stands.
- A Node major is a planned change in its own pull request, moving the Dockerfile, the CI's
  `node-version`, the README and `@types/node` together.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Keep proposing platform majors | Node majors would arrive split across pull requests that are wrong on their own |
| Ignore every major | Library majors with security or bug fixes would go unnoticed |
| Pull requests against `main` | Skips `develop`, the branch every change goes through |

## Pros

- The weekly pull requests are the ones worth merging.
- Updates follow the same path as any change: `develop`, green CI, then `main`.

## Cons

- Nobody is reminded of a new Node major: checking for one is a manual habit.
- The ignore rules name dependencies: a new platform image needs its own rule.
