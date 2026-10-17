# ADR-0009 — Serve the SPA from unprivileged nginx; the local compose runs the API

- **Status:** Accepted — CSP decided in ADR-0017
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

After `vite build` the front is static files. Production needs something to serve them with SPA
routing (any path returns `index.html`), long caching for hashed assets, compression and security
headers — without shipping a Node runtime. Locally, `npm run dev` needs a running foody-api, which
otherwise means a Java toolchain on every machine that works on the front.

## Decision

- **Dockerfile:** a `node:24-alpine3.24` stage runs `npm ci` and `npm run build`, type-check
  included; the runtime is `nginxinc/nginx-unprivileged:stable-alpine3.24-slim`, serving `dist/`
  as uid 101 on port 8080.
- **`nginx.conf`:** unknown paths fall back to `index.html`; `/assets/*` (content-hashed names)
  are cached for a year as `immutable`, everything else is `no-cache`; a missing asset is a 404,
  never the HTML; gzip; `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`; no version in
  `Server`.
- **`VITE_API_URL` is a required build argument:** the build fails without it.
- **`compose.deploy.yaml`:** the web container only — health check, read-only filesystem,
  `no-new-privileges`, 64 MB memory limit.
- **`compose.yaml`** (local) includes `../foody-api/compose.deploy.yaml`: the API and its
  PostgreSQL, for `npm run dev`.

Measured on 2026-10-16: 21 MB on disk, 8 MB compressed, 13 MB resident under 200 parallel
requests.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Node in production (`vite preview`, `serve`) | A runtime of tens of MB to serve static files; `vite preview` is not a production server |
| static-web-server or busybox httpd | Smaller, but unable to proxy `/api` if front and API ever move to one origin |
| Runtime config (`config.js` filled from env at start) | Build once, deploy anywhere, at the cost of a second config path next to `import.meta.env`; revisit with a second environment |
| Vite dev server in a container | File watching through a bind mount is slow on Windows and macOS; HMR belongs on the host |
| Copying the API's service definitions here | Two definitions of one stack drift apart; `include` reuses foody-api's |

## Pros

- 8 MB to pull; the image holds nginx and the built files only, run as non-root.
- Deep links work, and assets cache forever safely because their names change with content.
- Working on the front needs Docker, not Java, to have a backend.

## Cons

- One image per API URL, since the URL is baked in at build time.
- The local compose needs foody-api cloned beside foody-app, with its own `.env`, and it takes
  port 8080 like `./mvnw spring-boot:run` — only one of them runs at a time.
- No Content-Security-Policy yet: it needs the API's origin in `connect-src` and comes with the
  first real screens.
- The health check calls `127.0.0.1`, not `localhost`: inside the container `localhost` resolves
  to `::1`, where nginx does not listen.
