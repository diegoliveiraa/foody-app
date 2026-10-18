# foody-app — working rules

React 19 + Vite + TypeScript, linted by oxlint. Tailwind 4 + shadcn/Radix (ADR-0001), RTK Query
(ADR-0002), React Hook Form + Zod (ADR-0003), React Router (ADR-0004), Vitest + Testing Library,
Playwright. Entry `src/main.tsx`, screens in `src/pages/<area>/<screen>/` (layout below,
ADR-0005). Consumes `foody-api`. This file is the **single source of truth for this repo's
rules** — to change a rule, edit it here.

## Standing rules

These apply to every task, no exceptions, without needing to be restated.

**1. Only a local environment may be written to.** The front never talks to a database, but
anything that writes through the API — seed scripts, E2E runs, manual tests — runs only against
a **provably** local API. Any other target needs explicit per-case authorization from the user.

**2. Never commit or publish on your own.** No `commit`, `push`, `merge`, `rebase`, `tag`,
`gh pr create` — on any branch. Leave the change in the working tree, describe what would be
committed, and wait.

**3. The branch is chosen by the owner.** Never create or switch branches on your own
initiative.

**4. Never loosen the lint to make a rule pass.** `npm run lint` must end with zero warnings.
Fix the code, never `.oxlintrc.json`.

**5. Business rules live in the backend.** The front consumes contracts, it does not
reimplement them. UX validation may exist here; the API remains the authority.

**6. Every new architectural decision becomes a versioned ADR.** Chose between alternatives,
established a pattern everyone must follow, or decided **not** to do something? Write
`docs/adr/NNNN-title.md` with **the why, the pros and the cons**, and commit it **in the same
PR as the change** — a decision that lives only in the author's head becomes rework next
semester. Format and criteria: [`docs/adr/README.md`](./docs/adr/README.md).

**7. Every new screen or flow ships with an E2E spec, in the same PR** (ADR-0012). A new feature,
a new route, or a change to an existing flow ⇒ `e2e/tests/<area>/<screen>-<aspect>.spec.ts`,
importing `test`/`expect` from `e2e/support/fixtures` and stubbing every API call with
`api.respond(...)` — an unstubbed call fails the test. `api.respond` matches the pathname only;
`api.requests(method, path)` returns what the page sent to a stub (URL and JSON body), so a spec
asserts query parameters and bodies with `expect.poll`. Every page load restores the session first,
so a spec starts with `stubSession(api, me)` or `stubSignedOut(api)` (`e2e/support/session`), with
the typed `/me` fixtures of `e2e/support/me`. It runs in every R13 viewport by itself;
`expectNoHorizontalOverflow` (`e2e/support/layout`) checks the layout. Select what a user perceives
— `getByRole`, `getByLabel`, `getByText` — and a `data-testid` only where nothing accessible
exists. A critical flow (login, the main CRUD) also gets a spec in `e2e/integrated/`, against the
real API and seed data.

## Folder layout

Every kind of file has one place (ADR-0005). A folder is created with its first file — never
empty, never "for later".

```
src/
  @types/<domain>.d.ts            API contracts (R17)
  assets/                         images and fonts imported by code
  components/
    ui/<primitive>.tsx            shadcn primitives (R4); their cva variants in <primitive>-variants.ts
    <composite>/index.tsx         composites shared by screens (data-table, page-header…); one that
                                  owns more files lays them out like a screen (components, hooks/)
    store-layout/                 the store area's shell; backoffice-layout/ and auth-layout/ the
                                  others' — chosen by the route's area, never by role (ADR-0014)
  constants/                      app-wide consts; messages.ts holds messages shared by screens;
                                  screens.ts the module and screen keys and their icons (R18)
  hooks/use-<name>.ts             generic hooks
  pages/<area>/
    <area>.routes.ts              the area's route: its layout and its screens' routes
    <screen>/
      <screen>.routes.ts          the screen's route; its views lazy-loaded
      index.tsx                   the view — or list/, create/, edit/, detail/, checkout/, board/,
                                  history/, each laid out like a screen
      columns.tsx                 table columns; the table itself is components/data-table
      components/<name>.tsx       this screen only; <name>/index.tsx once it owns more files
      hooks/use-<name>.ts         the screen's logic (R9)
      filter/                     filter state: index.ts (reducer), types.ts, hooks/
      constants/                  index.ts (consts, sentinels) · messages.ts (its messages)
      utils/<name>.ts             pure functions used only by this screen
      types.ts                    types shared inside the screen (R17)
  pages/auth/{login,register}/    public pages: handle { public: true }, outside /me (ADR-0014)
  pages/errors/<page>/            forbidden, not-found and unexpected error pages
  routes/
    index.tsx                     one createBrowserRouter over every <area>.routes.ts (ADR-0004)
    guards.ts                     loaders: session bootstrap and guards, derived from the handles
    navigation.ts                 /me joined with the route table: screen paths come from the
                                  table, never from a second path map
    handles.ts · types.ts         route handle builders and the route-level types
  services/
    api.ts                        the RTK Query base (ADR-0002)
    cache-tags.ts                 every cache tag type, declared once (ADR-0006)
    <domain>.ts                   one per backend domain, via injectEndpoints
    validation-schemas/<form>.ts  Zod schemas (ADR-0003); fields.ts for fields shared by forms
  store/index.ts                  the Redux store; global slices in store/slices/<name>.ts
  store/listeners/<name>.ts       listener middleware: side effects triggered by actions (R7)
  test/                           Vitest setup, the MSW server (server.ts) and test helpers
  utils/<name>.ts                 generic pure functions
e2e/
  tests/<area>/<screen>-<aspect>.spec.ts   stubbed API, every viewport (standing rule 7)
  integrated/<flow>.spec.ts                critical flows against the real API and seed data
  support/                                 fixtures.ts (api stubs), layout.ts, constants.ts,
                                           session.ts and me.ts (session stubs, /me fixtures),
                                           seed-accounts.ts (integrated suite credentials)
```

- **Names are kebab-case**, files and folders (`status-badge.tsx`, `use-order-filter.ts`). A hook
  file exports `use<Name>`.
- **A test sits beside the file it tests:** `status-badge.tsx` → `status-badge.test.tsx`. No
  `__tests__/`, `test/` or `specs/` folders under `src/pages`.
- **Filter state is a `useReducer` in the screen's `filter/`.** It becomes a slice in
  `src/store/slices/` only when it must survive leaving the screen.
- **Promote, don't copy.** When a second screen needs something, it moves up to `src/components`,
  `src/hooks`, `src/utils` or `src/constants` — never a copy in each screen (R4).

## Code rules

They apply to the **file you touched**. Legacy code is not swept or migrated in bulk — except
by R14: a touched file loses every comment.

### R1 — No nesting

- **Guard clause / early return.** Handle the exit first and `return`; the happy path stays
  unindented.
- **No `else` after `return`.** If the `if` returns, the `else` is noise.
- **No `if / else if / else` chains** → use a `Record`/lookup (R3).
- **`switch` is forbidden**, `default` included — always a `Record`.
- **No nested ternaries** to pick a value or what to render.

```tsx
// bad
switch (status) { case "OK": return <Ok />; default: return <Error />; }
const label = a ? "A" : b ? "B" : "C";

// good
const VIEWS: Record<Status, () => JSX.Element> = { OK: () => <Ok />, ERROR: () => <Error /> };
return (VIEWS[status] ?? VIEWS.ERROR)();

const LABELS: Record<State, string> = { a: "A", b: "B", c: "C" };
const label: string = LABELS[state];
```

### R2 — Files ≤ 800 lines

A fat screen component becomes smaller components plus hooks, split by responsibility.

### R3 — No magic strings or numbers

- Domain values **always** live in an enum, const or `Record`. Look for the existing one first
  (`src/constants`).
- Domain lists are **derived from the enum**, never retyped in each file.
- Magic numbers become named consts (`MAX_UPLOAD_BYTES`, not `5 * 1024 * 1024`).
- **UI and error messages live in a messages catalog:** the screen's `constants/messages.ts` when
  only that screen uses them, `src/constants/messages.ts` once a second one does. No literal
  repeated across files. That includes **JSX text** (`<h2>Seus pedidos</h2>`),
  `placeholder`/`title`/`aria-label` props, column headers and option labels — not only toasts.
- **Sentinel values are consts too:** `"ALL"`, `""` as "no filter", `"pt-BR"`, page `1`,
  debounce `500`. Look in the screen's `constants/index.ts` before typing one.
- **A literal union used in more than one place becomes a const + derived type, declared once.**
  `key: "restaurantId" | "categoryId"` repeated in the state, the hook, the view model and the
  component is exactly what a reviewer flags:

```ts
// constants/index.ts
export const FILTER_KEYS = { RESTAURANT: "restaurantId", CATEGORY: "categoryId" } as const;
// filter/types.ts
export type FilterKey = (typeof FILTER_KEYS)[keyof typeof FILTER_KEYS];
```

- **Anything that varies by tab/status/mode is a `Record` keyed by that enum** (field names,
  placeholders, option lists) — never a ternary chain on `tab === …` (R1), and never a
  template string that builds a key (`` `${…}Search` as keyof typeof filters ``).

### R4 — Reuse before you create

UI primitives (button, table, dialog, select, toast…) live in `src/components/ui/` and domain
composites in `src/components/`. **Building a button, table or modal from scratch in a screen
when a primitive exists is a violation** — if it doesn't exist yet, it is born there.

A primitive is born with `npx shadcn add <name>` (config in `components.json`), and the generated
file is a file you touched: explicit types (R15), no comments (R14), and its `cva` variants moved
to a sibling `<name>-variants.ts` (exported from the component file, they trip oxlint's
`only-export-components`). Icons come only from `lucide-react`; class names are merged with `cn`
from the `cn` package.

Formatters (money, dates) live in `src/utils` and hooks in `src/hooks` — `grep` before writing
your own. A local `const money = (v) => v.toLocaleString(…)` in a screen is a duplicate. The
same helper copied into two files of the same screen is a duplicate too.

### R5 — Server data comes from the data layer

- **Server** → RTK Query (ADR-0002), one file per domain in `src/services/*`. No `fetch`/`axios`
  inside a component.
- **Forms** → React Hook Form plus a Zod schema in `src/services/validation-schemas/`
  (ADR-0003).
- **Derived values** → a selector or `useMemo`.

Request errors go through **one** extractor in `src/utils` — never a second one. The API answers
errors as Problem Details (foody-api ADR-0005): show `detail`, branch on `code` — never on the
text — and map `errors[]` (`{ field, message }`) onto the form's fields. `requestId` names the
request in the API's logs: keep it with any error that gets reported (foody-api ADR-0010).

List screens are paginated on the server: they send `page` (from 1), `pageSize` and
`sort=property,asc|desc`, and render `data` with `meta` (`page`, `pageSize`, `totalItems`,
`totalPages`, `hasNext`, `hasPrevious`). The page-size selector offers exactly 10, 25, 50 and
100, declared once in `src/constants` — the API rejects anything else. A list renders cards below
1024px and `components/data-table` from 1024px up (`LIST_TABLE_BREAKPOINT_PX`), through
`components/responsive-list`, with `components/list-pagination` under both (ADR-0018); the cards sort
through `components/sort-select`, shown only below that breakpoint (ADR-0025).

**Cache tags (ADR-0006)** decide which screens refresh after a write:

- **Declared once** in `src/services/cache-tags.ts` — a const object, one type per backend
  resource (`Order`), never per query shape (`ONE_ORDER`/`ALL_ORDERS`). No TS `enum`:
  `erasableSyntaxOnly` rejects it.
- **A list provides `LIST_ID` plus one tag per item; a detail provides its item.** Create
  invalidates `LIST_ID`; update and delete invalidate the item's `{ type, id }`, plus `LIST_ID`
  when the list shows what changed.
- **Only the mutation invalidates**, in its own `invalidatesTags` — another domain's tags
  included, since there is one API. A component never calls `refetch()` or
  `util.invalidateTags` after a mutation; "reload" buttons go through one hook in `src/hooks` that
  ends in `invalidateTags`. `onQueryStarted` is for optimistic updates and for storing a
  mutation's answer in the cache (ADR-0021), never for invalidating.
- **Every declared tag is provided by some query.** Invalidating a type nobody provides is dead
  code.

```ts
// src/services/cache-tags.ts
export const CACHE_TAGS = { ORDER: "Order", RESTAURANT: "Restaurant" } as const;
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
export const LIST_ID: string = "LIST";

// src/services/orders.ts — OrderTag = TagDescription<CacheTag>
getOrders: builder.query<Order[], void>({
  providesTags: (orders: Order[] = []): OrderTag[] => [
    { type: CACHE_TAGS.ORDER, id: LIST_ID },
    ...orders.map((order: Order): OrderTag => ({ type: CACHE_TAGS.ORDER, id: order.id })),
  ],
}),
updateOrder: builder.mutation<Order, UpdateOrderRequest>({
  invalidatesTags: (_result, _error, { id }: UpdateOrderRequest): OrderTag[] => [
    { type: CACHE_TAGS.ORDER, id },
    { type: CACHE_TAGS.ORDER, id: LIST_ID },
  ],
}),
```

### R6 — TDD: the test fails first

Write the failing test, run it, and confirm it failed **for the right reason** (broken
assertion, not a compilation error). Then the minimum code that passes. Then refactor on green.

### R7 — Avoid `useEffect`

**No fetching in `useEffect`** (R5 covers data). `useEffect` is only for genuinely imperative
integration — focus, listeners, canvas — isolated in a hook whose name says why. Never for session
or data logic: session bootstrap and route guards are React Router loaders (`src/routes/guards.ts`),
side effects triggered by actions live in RTK listener middleware (`src/store/listeners/`), and
media queries and timers are read with `useSyncExternalStore` (`useIsMobile`, `useCountdown`).

### R8 — No `any`

Includes `as any` and implicit `any` on props. Don't know the type? `unknown` + narrowing.

### R9 — Componentize

Screens are assembled from small, named components; **logic lives in a hook (`use*`)**, not in
JSX. No god components.

### R10 — No `console.*`

Nothing in production — debugging goes out before hand-off.

### R11 — No floating promises

Every promise is `await`ed, `return`ed, or has an explicit `.catch(...)`. In a submit handler
this is what separates an error shown to the user from an error swallowed.

### R12 — AAA tests naming the acceptance criterion

Arrange, Act, Assert in that order, never interleaved. The **name states the acceptance
criterion** in plain language. Every behaviour gets a happy path **and** an error/edge path.

A test that reaches the API declares the answer with MSW in its Arrange —
`server.use(http.get(apiUrl("/orders"), () => HttpResponse.json(page)))` (`src/test/server.ts`).
A request nobody answered fails the test, and the error path is an answer too
(`HttpResponse.json(problem, { status: 409 })`).

### R13 — Accessibility and responsiveness are not extras

No horizontal overflow at 320/768/1280/1536 (that's what the E2E suite covers). Every
interactive component has an accessible label.

### R14 — Zero comments: a touched file leaves without any

No comment of any kind — `//`, `/* */` or JSDoc — in code **or in specs** (no `// Arrange` /
`// Act` / `// Assert`). The name says what the code does; the why goes in the PR description and
in the commit message.

**A file you touch leaves with zero comments, including the ones that were already there.**
Remove them in the same change. This is the one rule that does sweep legacy code — file by file,
only the files the change touches.

Not comments, and therefore kept: tool directives that change behaviour
(`// oxlint-disable-next-line <rule>`, `// @ts-expect-error`, `// prettier-ignore`), and only
where removing them breaks the build. Never add one to dodge a rule (standing rule 4).

Check with `npm run check:comments` (CI runs it too): it reads every `.ts`/`.tsx` file in the repo,
ignores what sits inside string and template literals — a URL is not a comment — and prints each
line that still carries one. The generated `src/@types/api.d.ts` is exempt: nobody edits it, and
its comments come from the generator and the API's contract.

### R15 — Always explicit types

Including local variables, function return types and component return types (`JSX.Element`).

### R16 — One folder per role

`hooks/` (never `hook/`), `constants/` (never a parallel `enum/`), `utils/` (never a parallel
`helpers/` or `lib/` — shadcn's default `lib/` is redirected to `utils/` in `components.json`). Don't create a second folder for a role that already has one.

### R17 — Types live in their layer

| Type | Where |
|---|---|
| API contract (request, response, entities the backend returns) | Generated into `src/@types/api.d.ts` by `npm run api:types` (ADR-0010), never edited. `src/@types/<domain>.d.ts` names the ones a domain uses — `export type Order = components["schemas"]["OrderResponse"];` — and the service in `src/services/<domain>.ts` imports from there |
| Screen types shared by more than one file (view model, row types, shapes passed between hook and components) | `src/pages/<area>/<screen>/types.ts` |
| Filter state, action signatures, filter key types | `src/pages/<area>/<screen>/filter/types.ts` |
| Props of a single component | the component file itself (`interface XProps`) |

Never: a request or response shape typed by hand when the contract has it; an `interface`/`type`
of the API declared inside `src/services/*`; a view model declared
inside the hook; a shape exported from a component for a hook to import; the same interface
declared twice (TS **merges** duplicates silently); `Preview["x"]["items"][number]` aliases
retyped in each file — name the type once in `@types` and import it.

### R18 — Navigation and access come from `/me`

The sidebar renders `GET /me` → `modules[].screens[]`, in the order and with the labels the API
returns (ADR-0007). The front owns only routes and icons:

- Each `<screen>.routes.ts` sets `handle: { screenKey, icon }`; each `<area>.routes.ts` sets
  `handle: { moduleKey, icon }`. Keys are `<area>` and `<area>.<screen>` — the folder names —
  declared once in `src/constants/screens.ts`, with their icons. Build handles with
  `screenHandle(key)` / `moduleHandle(key)` (`src/routes/handles.ts`).
- **Public pages** (login, register) set `handle: { public: true }` (`PUBLIC_HANDLE`) instead of a
  screen key and are not in `/me`; a signed-in user who opens one is sent home.
- Guards are attached from the handles by `guardRoutes` — never written per route. A screen absent
  from `/me` is forbidden: its loader throws 403 and the forbidden page renders inside the shell; a
  signed-out visitor goes to `/login?redirectTo=<path>`. No role checks in components
  (`role === "ADMIN"`).
- Whether a screen offers an action comes from `useCan(screenKey, action)`, never a local rule.
- `/me` lives only in the RTK Query cache — no copy in `localStorage` or a context — and is
  reset on logout.
- Hiding is UX, not security: the API authorizes every request on its own (standing rule 5).

### R19 — The token never leaves memory

Authentication follows ADR-0008:

- The access token lives only in the session slice (`src/store/slices/session.ts`) — never in
  `localStorage`, `sessionStorage`, a readable cookie, a URL or a log. The refresh token is an
  `HttpOnly` cookie the front never reads.
- Every request goes through the base query in `src/services/api.ts`, which attaches and renews
  the token. No component or service builds an `Authorization` header or retries a 401 itself.
- Login, register, refresh and logout live in `src/services/auth.ts`. The `refresh` endpoint and
  the base query's renewal share one single-flight refresh (`refreshAccessToken` in
  `src/services/api.ts`, under the `foody-refresh` Web Lock when the browser has one). These are the
  only requests sent with `credentials: "include"`, and the only ones sent without the bearer.
- Logout is the `logoutRequested` action, and a refused refresh dispatches `sessionExpired`: the
  session listener clears the token, leaves for `/login`, and only then calls `resetApiState`.

## Environment

- `npm run e2e` starts its own Vite on `http://localhost:4173` with the API pointed at a fake
  origin, so it never reuses — or reaches the API through — the dev server on 5173. Unit tests use
  `http://api.test`, set in `vite.config.ts`. The fake API is cross-origin: `api.respond` sends the
  CORS headers the real API sends (allowed origin, credentials, `Access-Control-Expose-Headers:
  Retry-After, X-Request-Id`) — without the expose header the app cannot read `Retry-After`.
  Preflights never reach `page.route` (Chromium under Playwright answers them), so specs do not
  stub `OPTIONS`.
- **A backend for `npm run dev` and the integrated suite:** the API's seeded demo stack —
  `docker compose up -d --build --wait` in `../foody-api` (API on `http://localhost:8080`, demo
  accounts `admin@foody.local`, `equipe@foody.local` and `cliente@foody.local`, password
  `Foody#2026`, CORS for `http://localhost:5173` and `http://localhost:4174`). It takes port 8080
  like `./mvnw spring-boot:run` there — only one of them runs at a time.
- **Integrated suite (ADR-0016, ADR-0027), local only:** with that API up, `npm run e2e:integrated`.
  It starts its own Vite on 4174 (an origin the API must allow) and logs in with the demo accounts;
  `SEED_CUSTOMER_EMAIL`, `SEED_STAFF_EMAIL`, `SEED_DEFAULT_PASSWORD`, `SEED_ADMIN_EMAIL` and
  `SEED_ADMIN_PASSWORD` override them one by one — against `./mvnw spring-boot:test-run`, export
  the API's `.env` first (`set -a; . ../foody-api/.env; set +a`). `admin-users.spec.ts` registers a
  fresh customer on every run (a unique e-mail) and changes only that account, never the seed ones.
- `foody-api` runs on `http://localhost:8080`; the front runs on `http://localhost:5173`. **`.env` is
  optional:** when neither the environment nor an `.env*` file sets `VITE_API_URL`, `vite.config.ts`
  defines it as `http://localhost:8080` (never in test mode). To point elsewhere, copy
  `.env.example` to `.env` or export the variable — the API base URL lives only in `VITE_API_URL`,
  never hard-coded in a service.
- **`compose.yaml` is the standalone web demo (ADR-0027):** `docker compose up -d --build --wait`
  builds the production image with `VITE_API_URL` (default `http://localhost:8080`) and serves it on
  `http://localhost:5173` (`WEB_PORT`); `docker compose down` stops it. It never starts the API, and
  it shares port 5173 with `npm run dev` — one at a time. It and `compose.deploy.yaml` are both
  project `foody-web`, and a `WEB_PORT` in `.env` applies to both.
- **`VITE_*` variables are inlined at build time:** after changing `.env`, restart `dev` or
  rebuild; reloading the page does nothing. The same goes for the image —
  `docker compose up -d --build` for the demo,
  `docker build --build-arg VITE_API_URL=<url> -t foody-app .` otherwise — one image per API URL. The build also renders `nginx.conf.template` into the image's nginx config,
  with the API's origin in the Content-Security-Policy (ADR-0017).
  **Deploy:** `docker compose -f compose.deploy.yaml up -d`, with the `.env` on the host.

## Before handing off

`npx tsc -b` · `npm run lint` · `npm run format:check` · `npm run check:comments` · `npm test` ·
`npm run e2e` · `npm run build` — the same gates CI runs (ADR-0011). A change to a critical flow
also runs `npm run e2e:integrated` against the local API (ADR-0016). The lint is type-aware and fails on any warning; it enforces
R8 (`any`), R10 (`console`), R11 (floating and misused promises), R15 (function return types) and
R1 (nested ternaries, `else` after `return`). `npm run format` applies Prettier. Used a contract
foody-api changed? `npm run api:types` first, and commit the regenerated `src/@types/api.d.ts` with
the change.

**Self-review against what reviewers keep flagging** — over the files you touched, fix every
hit before handing off:

- literal text in JSX or in `placeholder=`/`title=`/`aria-label=` props → R3
  (`src/constants/messages.ts`).
- `"ALL"`, `""`, `"pt-BR"`, bare numbers → R3 (screen consts).
- the same `"a" | "b"` union or the same helper in two files → R3/R4.
- `tab === X ? … : tab === Y ? …` → R1 (`Record` by tab).
- `interface`/`type` outside the table in R17 → move it.
- `refetch()` after a mutation, or `invalidateTags` outside `src/services` and the reload hook →
  R5 (the mutation's `invalidatesTags`).

⚠️ **Do not use `tsc --noEmit`**: it runs against the root `tsconfig.json`, which has
`"files": []`, so it compiles nothing and exits 0 — a false green.

## When to open another file

Writing code needs none — what's above is enough. Recording an architectural decision
(standing rule 6) → [`docs/adr/README.md`](./docs/adr/README.md).
