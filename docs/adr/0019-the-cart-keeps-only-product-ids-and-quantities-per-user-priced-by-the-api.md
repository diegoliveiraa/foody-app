# ADR-0019 — The cart keeps only product ids and quantities, per user, priced by the API

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

The customer fills a bag on the menu and pays for it at checkout, often after leaving the page or
reloading it. foody-api ADR-0020 makes `POST /menu/quote` the only place that prices a cart, and
foody-api ADR-0005 keeps money arithmetic out of the front, which parses JSON numbers as floats.
A cart needs to survive a reload, but a phone or a counter tablet may be shared by several people,
and nothing the API stores holds a cart before the order exists. R18 and R19 already forbid copying
`/me` or the token into `localStorage`.

## Decision

- The cart is a global slice, `src/store/slices/cart.ts`, holding only `{ items: [{ productId,
  quantity }] }` in the order products were added. It never holds a name, a price or a total. Its
  reducers cap a product at 20 units and the cart at 50 distinct products — the limits of
  `POST /menu/quote` — and a product leaves the cart when its quantity reaches zero.
- A listener, `src/store/listeners/cart.ts`, writes the items to `localStorage` under
  `foody:cart:<userId>` after every change the customer makes, and replaces the cart with the one
  stored for the user whenever `GET /me` arrives. What it reads is validated with a Zod schema; data
  that fails it, or is not JSON, becomes an empty cart. On logout or session end it empties the cart
  in memory only, so the stored cart waits for that user's next login. Storage access never throws.
- Every amount the bag shows comes from the latest quote: `quoteCart` is an RTK Query query keyed by
  the cart's items, skipped while the cart is empty, tagged with the menu so a catalog change
  re-prices it. The UI reads `currentData`, so a total from an older cart is never shown while the
  new one is priced; it shows a skeleton instead. Items the quote marks `available: false` are
  marked in the bag and block continuing to checkout until they are removed.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Keep prices in the cart and add them up in the front | Float arithmetic, and a stale price would show one total and charge another (foody-api ADR-0005, ADR-0020) |
| One cart key for the browser | Whoever signs in next on a shared device sees, and could order, someone else's bag |
| Cart only in memory | Lost on every reload or closed tab, the usual way a phone user leaves and comes back |
| A server-side cart | No such resource in the API; a write per tap on "+" for something that is not an order yet |
| `sessionStorage` | Lost when the tab closes, which on phones happens all the time |
| Clear the stored cart on logout | The user's bag is gone the next time they sign in on their own device |

## Pros

- The front holds no money: the bag, the cart bar and later the checkout all show the API's numbers.
- A reload or a new tab brings the user's own bag back; another user on the same device never sees it.
- Corrupt or tampered storage costs an empty bag, not a broken screen or a rejected quote.

## Cons

- Every change to the bag is a round trip before its total shows; offline, there is no total.
- The bag lives in one browser: it does not follow the user to another device.
- Stored carts of past users stay in `localStorage` until they sign in again; nothing expires them.
- Two tabs of the same user each keep their own in-memory cart; the last one to change it wins in
  storage until the other reloads.
- The quote is not a reservation: a price can change between the bag and the order.
