# ADR-0004 — Route with React Router in data mode

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

The app is a Vite SPA with screens under `src/pages/<area>/<screen>/` and no router yet. Each
screen should be downloaded only when visited, and the full set of routes should be readable in
one place.

## Decision

Routing uses the `react-router` package in data mode: a single `createBrowserRouter` route table
rendered by `RouterProvider`, with each screen lazy-loaded through the route's `lazy` option.
`react-router-dom` is not installed — since v7 it only re-exports `react-router`.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| TanStack Router | Type-safe params, but a younger ecosystem and more ceremony to register the route tree |
| React Router framework mode | Brings file-based routing and SSR tooling a Vite SPA does not need |
| Declarative `<Routes>` only | No route-level lazy loading or data APIs if we need them later |

## Pros

- The most used React router: documentation and answers for any problem.
- One route table to read; screens split into their own chunks.

## Cons

- Route and search params are untyped strings; each screen parses and validates its own.
- Most examples online are v6 with `react-router-dom`; imports and some APIs differ in v8.
