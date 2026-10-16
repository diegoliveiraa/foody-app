# foody-app — working rules

React 19 + Vite + TypeScript, linted by oxlint. Tailwind 4 + shadcn/Radix (ADR-0001), RTK Query
(ADR-0002), React Hook Form + Zod (ADR-0003), React Router (ADR-0004), Vitest + Testing Library,
Playwright. Entry `src/main.tsx`, screens in `src/pages/<area>/<screen>/`. Consumes `foody-api`. This file is the **single source of truth
for this repo's rules** — to change a rule, edit it here.

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

**7. Every new screen or flow ships with an E2E spec.** A new feature, a new route, or a change
to an existing flow ⇒ a Playwright spec under `e2e/tests/`, **in the same PR** (`npm run e2e`,
config in `playwright.config.ts`). There is no spec yet — the first one sets the pattern
(fixtures, selectors, naming) every later spec follows.

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
- **UI and error messages are centralized** in `src/constants/messages.ts`. No literal repeated
  across files. That includes **JSX text** (`<h2>Seus pedidos</h2>`),
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
`only-export-components`). Icons come only from `lucide-react`; class names are merged with `cn` from the `cn` package.

Formatters (money, dates) live in `src/utils` and hooks in `src/hooks` — `grep` before writing
your own. A local `const money = (v) => v.toLocaleString(…)` in a screen is a duplicate. The
same helper copied into two files of the same screen is a duplicate too.

### R5 — Server data comes from the data layer

- **Server** → RTK Query (ADR-0002), one file per domain in `src/services/*`. No `fetch`/`axios`
  inside a component.
- **Forms** → React Hook Form plus a Zod schema in `src/services/validation-schemas/`
  (ADR-0003).
- **Derived values** → a selector or `useMemo`.

Request errors go through **one** extractor in `src/utils` — never a second one.

### R6 — TDD: the test fails first

Write the failing test, run it, and confirm it failed **for the right reason** (broken
assertion, not a compilation error). Then the minimum code that passes. Then refactor on green.

### R7 — Avoid `useEffect`

**No fetching in `useEffect`** (R5 covers data). `useEffect` is only for genuinely imperative
integration — focus, listeners, canvas — isolated in a hook whose name says why.

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

Check before handing off — anything printed that is not a string literal is a comment to remove.
`BASE` is the branch the work started from, so files already committed on the branch are covered
too. Comments at the end of a line print as well; URLs and globs inside strings also print —
those are not comments.

```bash
BASE=main
{ git diff --name-only --diff-filter=d "$BASE"...HEAD; git diff --name-only --diff-filter=d HEAD; \
  git ls-files --others --exclude-standard; } | sort -u | grep -E '\.(ts|tsx)$' \
  | xargs grep -nE '//|/\*|^\s*\*' | grep -vE 'oxlint-|eslint-|@ts-|prettier-ignore'
```

### R15 — Always explicit types

Including local variables, function return types and component return types (`JSX.Element`).

### R16 — One folder per role

`hooks/` (never `hook/`), `constants/` (never a parallel `enum/`), `utils/` (never a parallel
`helpers/`). Don't create a second folder for a role that already has one.

### R17 — Types live in their layer

| Type | Where |
|---|---|
| API contract (request, response, entities the backend returns) | `src/@types/<domain>.d.ts` — the service in `src/services/<domain>.ts` imports from there |
| Screen types shared by more than one file (view model, row types, shapes passed between hook and components) | `src/pages/<area>/<screen>/types.ts` |
| Filter state, action signatures, filter key types | `src/pages/<area>/<screen>/filter/types.ts` |
| Props of a single component | the component file itself (`interface XProps`) |

Never: an `interface`/`type` of the API declared inside `src/services/*`; a view model declared
inside the hook; a shape exported from a component for a hook to import; the same interface
declared twice (TS **merges** duplicates silently); `Preview["x"]["items"][number]` aliases
retyped in each file — name the type once in `@types` and import it.

## Environment

- `foody-api` runs on `http://localhost:8080`; the front runs on `http://localhost:5173`. The API
  base URL goes in `.env` as `VITE_API_URL` — never hard-coded in a service.
- **`VITE_*` variables are inlined at build time:** after changing `.env`, restart `dev` or
  rebuild; reloading the page does nothing.

## Before handing off

`npx tsc -b` · `npm run lint` (zero warnings) · `npm test`.

**Self-review against what reviewers keep flagging** — over the files you touched, fix every
hit before handing off:

- literal text in JSX or in `placeholder=`/`title=`/`aria-label=` props → R3
  (`src/constants/messages.ts`).
- `"ALL"`, `""`, `"pt-BR"`, bare numbers → R3 (screen consts).
- the same `"a" | "b"` union or the same helper in two files → R3/R4.
- `tab === X ? … : tab === Y ? …` → R1 (`Record` by tab).
- `interface`/`type` outside the table in R17 → move it.

⚠️ **Do not use `tsc --noEmit`**: it runs against the root `tsconfig.json`, which has
`"files": []`, so it compiles nothing and exits 0 — a false green.

## When to open another file

Writing code needs none — what's above is enough. Recording an architectural decision
(standing rule 6) → [`docs/adr/README.md`](./docs/adr/README.md).
