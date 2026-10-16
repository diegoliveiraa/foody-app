# ADR-0003 — Build forms with React Hook Form and Zod

- **Status:** Accepted
- **Date:** 2026-10-16
- **Decided by:** Diego

## Context — why this became a decision

`CLAUDE.md` R5 requires a form library plus a schema in `src/services/validation-schemas/`, and
left both open until the first form. The `form` primitive of shadcn (ADR-0001) is built on React
Hook Form.

## Decision

Forms use React Hook Form with a Zod 4 schema through `zodResolver`. Each schema lives in
`src/services/validation-schemas/` and the form's value type is inferred from it (`z.infer`),
never retyped. The schema covers UX validation only; the API stays the authority (standing
rule 5).

## Why this one and not the others

| Alternative | Why not |
|---|---|
| Formik | Re-renders the whole form per keystroke and is barely maintained |
| TanStack Form | Viable, but younger, and shadcn's `form` targets React Hook Form |
| Controlled `useState` | Re-renders and hand-written validation; pushes logic into JSX (R9) |
| Yup | Weaker TypeScript inference than Zod |

## Pros

- Uncontrolled inputs: typing does not re-render the whole form.
- One schema gives both runtime validation and the TypeScript type.
- shadcn's `form` primitive works with it as is.

## Cons

- Radix-based inputs (select, checkbox, switch) need `Controller` wiring.
- Validation rules are duplicated from the backend and can drift from it.
- Zod 4 changed how custom error messages are declared; examples written for Zod 3 need
  adapting.
