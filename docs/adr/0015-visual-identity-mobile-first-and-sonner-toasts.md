# ADR-0015 — Visual identity, mobile-first and Sonner toasts

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

The approved prototype sets Foody's look: warm orange on cream, a display face for titles, phones
first. The shadcn theme shipped neutral grey, a dark mode nobody designed and 32px controls that are
too small to tap. The first slices also need toasts — a rate-limited call and an expired session
must tell the user something wherever they are.

## Decision

- **Tokens:** the prototype's palette is mapped onto the shadcn tokens in `src/index.css` —
  primary `#C2410C` (hover `#9A3412`), background `#FFFBF7`, back-office background `#F7F5F3`,
  foreground `#1C1917`, muted text `#57534E`, borders `#F0EBE7`, inputs `#D6D3D1`, radius 14px.
  Light theme only: no dark tokens, no `next-themes`.
- **Type:** titles in Bricolage Grotesque, body in Geist, both self-hosted through
  `@fontsource-variable`.
- **Mobile-first with one layout breakpoint**, 768px (`md`). Layout switches in CSS; JavaScript reads
  the breakpoint only where a prop must change, through `useIsMobile` (`useSyncExternalStore` over
  `matchMedia`).
- **Touch targets of at least 44px:** the generated button, input, sidebar and menu sizes are raised
  when the primitive is added.
- **Toasts are Sonner** (`npx shadcn add sonner`): one `<AppToaster>`, dark like the prototype,
  top-center below 768px and bottom-right above.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Keep the neutral shadcn theme | Not the approved design |
| Google Fonts from their CDN | A third-party request on every load, and the CSP (ADR-0017) would have to allow it |
| Radix Toast | shadcn deprecated its toast in favour of Sonner; queueing and swipe come built in |
| Dark mode now | No approved dark design; `next-themes` would be a dependency for nothing |
| Breakpoints in JavaScript for layout | Layout should not wait for script; CSS already knows the width |

## Pros

- Screens look like the prototype without per-screen colours: everything reads the tokens.
- Fonts come from our origin, cached with the hashed assets.
- One toast API for every message, placed where each device expects it.

## Cons

- `npx shadcn add` brings neutral sizes and `next-themes` again: every add is reviewed against this
  ADR (R4 already treats a generated file as a touched file).
- The two variable fonts add about 130 KB of `woff2`, split by unicode range.
- Light theme only; a dark mode later means designing and adding the dark tokens.
