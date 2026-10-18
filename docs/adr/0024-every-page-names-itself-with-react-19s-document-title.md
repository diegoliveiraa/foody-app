# ADR-0024 — Every page names itself with React 19's document title

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

Every tab of the app read "Foody", the static `<title>` of `index.html`: two open orders, the
history and the products list were indistinguishable in the tab strip, the browser history and
the bookmarks, and screen readers announced the same name on every navigation. The SPA has no
server render, so the title has to change in the browser. React 19 hoists a `<title>` rendered
anywhere in the tree into `<head>` and removes it when the component unmounts; R7 rules out a
`useEffect` that writes `document.title`.

## Decision

- Every page renders one `DocumentTitle` (`src/components/document-title`), which renders React's
  native `<title>` with `MESSAGES.DOCUMENT_TITLE(label)`: "<label> · Foody", or "Foody" while the
  label is not known yet.
- `PageHeader` renders it from its `title` — a screen's `/me` label or its visible title
  ("Dashboard", "Finalizar pedido") — and takes a `documentTitle` when the tab must name the
  subject instead of the heading ("Pedido #1101" on the staff detail, whose heading also names the
  customer).
- Pages without a `PageHeader` render it themselves: login ("Entrar"), sign-up ("Criar conta") and
  the forbidden, not-found and unexpected-error pages.
- Exactly one title per page: the shells and shared components other than `PageHeader` never render
  one.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| `useEffect(() => { document.title = … })` per page | Imperative DOM writes that R7 forbids, and the previous title stays when a page forgets to set one |
| A title in each route's `handle`, applied by a router listener | The detail pages need data the loader does not have (the order number); the route would only know the screen key |
| `react-helmet-async` | A dependency and a provider for what React 19 now does natively |
| Keep "Foody" | Tabs, history and assistive technology cannot tell pages apart |

## Pros

- The title follows the page: it changes with the order shown and goes away when the page unmounts.
- One component and one message builder; every screen with a `PageHeader` is covered without code
  of its own.
- Nothing imperative: React owns the `<title>` element.

## Cons

- React adopts the static `<title>` of `index.html` on the first page and inserts new ones before
  it; two mounted `DocumentTitle`s would compete, so a second one inside a page is a bug.
- While `/me` or a detail is loading the tab shows the screen label or "Foody" and then changes.
- Every page outside `PageHeader` must remember to render one; the E2E title spec
  (`e2e/tests/app/page-titles.spec.ts`) is the check.
