# ADR-0026 — Checkout prefills the address from the customer's last order

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

Every order asked for the full delivery address again: CEP, street, number, complement,
neighbourhood, city and UF, typed on a phone. Most customers order to the same place. The API has
no "last address" or address-book contract, but every placed order keeps its `deliveryAddress`,
and the customer can already list their orders newest first (`GET /my-orders`) and open one
(`GET /my-orders/{id}`). Whatever the front remembers about a customer is personal data, and the
cart is the only thing it keeps on the device (ADR-0019).

## Decision

- When the bag is not empty, the checkout asks for the customer's orders through the existing
  `listMyOrders` query (newest first) and opens the first one with `getMyOrder`; its
  `deliveryAddress` is the address to offer. With an empty bag neither request is sent.
- The address fills the form only if it is still untouched when the address arrives
  (`formState.isDirty`). The decision is taken once: if the customer already typed, nothing is
  filled, and what they type is never overwritten (`resetOptions.keepDirtyValues`). The values
  reach React Hook Form through its `values` option, not a `useEffect`.
- While the form holds the prefilled address unedited, "Endereço do seu último pedido" shows under
  the address title; the first edit removes it.
- A customer without orders gets an empty form. A failure of either request is silent: no toast,
  no alert, the form stays empty.
- Nothing is written to `localStorage` or any other storage.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| The last address in `localStorage`, per user | Personal data at rest on the device, stale across devices and browsers, and outside the API contract |
| A new API endpoint for the last address | A contract change for something two existing calls already answer |
| A saved address book | A new feature with its own screens and contract, not a fix to retyping |

## Pros

- The usual order needs no typing: the address of the last order is one tap away from being sent.
- No new contract and no data kept on the device; the API stays the source of the address.
- The form never fights the customer: a typed field is never replaced.
- My Orders and the checkout share the same `listMyOrders` cache entry.

## Cons

- Two requests on every checkout load with a non-empty bag (the list and the order), unless the
  list is already cached.
- It offers the last address even when it was a one-off (a friend's house, the office once);
  the hint is the only warning.
- The list is paginated and sorted newest first, so only the latest order counts; an address the
  customer uses most often but not last is not offered.
- A customer who starts typing before the address arrives never gets it filled on that visit.
