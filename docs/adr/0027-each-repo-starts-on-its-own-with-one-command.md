# ADR-0027 — Each repo starts on its own with one command

- **Status:** Accepted
- **Date:** 2026-10-17
- **Decided by:** Diego

## Context — why this became a decision

The project is evaluated by someone who clones it on a clean machine with only Git and Docker. Here,
`docker compose up` built the API from `../foody-api/compose.deploy.yaml` (ADR-0009), so the front
did not start without the sibling repo, its `.env` and its JWT keys; `npm run dev` needed a `.env`;
and the integrated suite refused to start without five `SEED_*` variables (ADR-0016). foody-api now
ships its own seeded demo stack: `docker compose up -d --build --wait` there serves the API on
`http://localhost:8080` with three demo accounts and CORS for `http://localhost:5173`.

## Decision

- **`compose.yaml` is the standalone web demo** (project `foody-web`): one `web` service built from
  the Dockerfile with `VITE_API_URL` defaulting to `http://localhost:8080`, published on
  `${WEB_PORT:-5173}` with the deploy file's health check, plus a 1 s `start_interval` so `--wait`
  returns as soon as nginx answers. It includes nothing from `../foody-api`: the API starts from its
  own repo. `compose.deploy.yaml` stays the production file. This supersedes ADR-0009's local compose.
- **`npm run dev` needs no `.env`:** when neither the environment nor an `.env*` file sets
  `VITE_API_URL`, `vite.config.ts` defines it as `http://localhost:8080`. Unit tests keep
  `http://api.test` and the E2E configs their own origins; services still read only `VITE_API_URL`.
- **The integrated suite defaults to the API's demo accounts** (`e2e/support/seed-accounts.ts`); any
  `SEED_*` variable that is set still wins. This supersedes ADR-0016's failing on a missing variable.
- **CI starts the demo with the same command** and checks that `/`, `/login` and `/menu` answer 200
  with the Content-Security-Policy that names the API.

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Keep including the API's compose here | The front cannot start without the sibling repo, its `.env` and keys; a broken API build takes the front down; two places to learn how the API runs |
| A compose at a parent folder or in a third repo | A third thing to clone and keep in step, and it belongs to neither project |
| npm scripts that start both | Need Node — and for the API, Java — on the evaluator's machine |

## Pros

- `git clone` plus one command per repo, with Docker only: no `.env`, no Node, no Java.
- The demo is the production image — same Dockerfile, nginx config and CSP — so what is evaluated is
  what deploys.
- Each repo's compose, README and CI describe only that repo.
- A fresh clone runs `npm run dev` and `npm run e2e:integrated` with no setup.

## Cons

- Two commands in two repos; until the API is up, the login shows "Não foi possível falar com o
  servidor. Tente novamente."
- The API URL is baked in at build time: changing it means `docker compose up -d --build` again.
- Port 5173 is also `npm run dev`'s: only one of them runs at a time. Another `WEB_PORT` also needs
  that origin in the API's allowed CORS origins.
- Both compose files are project `foody-web` with a `web` service: starting one replaces the other's
  container. `WEB_PORT` in a `.env` applies to both, so `.env.example` no longer sets it.
- The demo credentials now live in this repo and must follow the API's demo seed if it changes.
- CI proves the demo serves the SPA, not that it reaches the API: there is no API in this repo's CI.
