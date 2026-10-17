# ADR-0017 — Render the Content Security Policy at build time

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

ADR-0009 left the Content-Security-Policy open: `connect-src` needs the API's origin, and that origin
is only known from the `VITE_API_URL` build argument. The web container runs with a read-only
filesystem, so nginx's start-time templating cannot write its config, and the token kept in memory
(ADR-0008) is only as safe as the page is free of injected script.

## Decision

- `nginx.conf.template` holds the server config with an `__API_ORIGIN__` placeholder. The Dockerfile's
  build stage extracts the origin (`scheme://host[:port]`) from `VITE_API_URL` — failing the build if
  it is not an http(s) URL — and renders `nginx.conf` with `sed`; the nginx stage copies the result.
- The policy: `default-src 'self'; connect-src 'self' <api origin>; style-src 'self' 'unsafe-inline';
  img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
  next to `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` and
  `Referrer-Policy: same-origin`.
- Zod runs `jitless` (`z.config` in `src/main.tsx`): without `unsafe-eval` its `new Function` probe
  would be reported as a violation on every load.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| nginx templates rendered at container start | Needs a writable `/etc/nginx/conf.d`; the container is read-only |
| A `<meta http-equiv>` policy in `index.html` | `frame-ancestors` is ignored in `<meta>`, and the URL is still a build-time value |
| Nonces or hashes for scripts | Need a server that renders each response; Vite's output has no inline script to hash |
| Dropping `'unsafe-inline'` for styles | Radix and Sonner position elements with inline styles |
| The full `VITE_API_URL` in `connect-src` | A path in a source expression matches only that exact path, not the endpoints under it |

## Pros

- A script injected into the page cannot load code from, or send data to, any other origin.
- The policy ships inside the image it protects: what was tested is what runs.
- No writable filesystem and no entrypoint script at start-up.

## Cons

- Styles keep `'unsafe-inline'`.
- Any new third-party origin — a font CDN, analytics, remote images — needs the template changed.
- One image per API origin (already true since ADR-0009).
- Checked in Chromium only; other browsers may report what Chromium accepts.
