import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import { useForm, type FieldErrors, type UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { problem } from "@/test/problems";
import { useFormApiErrors } from "./use-form-api-errors";

interface PetValues {
  name: string;
  kind: string;
}

interface RenderedForm {
  show: (error: unknown) => void;
  errors: FieldErrors<PetValues>;
}

const PET_FIELDS: readonly (keyof PetValues)[] = ["name", "kind"];

const CODE_FIELDS: Readonly<Partial<Record<string, keyof PetValues>>> = { UNKNOWN_KIND: "kind" };

function renderForm(): RenderHookResult<RenderedForm, unknown> {
  return renderHook((): RenderedForm => {
    const form: UseFormReturn<PetValues> = useForm<PetValues>();
    const show: (error: unknown) => void = useFormApiErrors(form.setError, PET_FIELDS, CODE_FIELDS);
    return { show, errors: form.formState.errors };
  });
}

describe("useFormApiErrors", () => {
  it("puts the API's field messages on the form's fields", () => {
    const { result }: RenderHookResult<RenderedForm, unknown> = renderForm();

    act((): void =>
      result.current.show({
        status: 400,
        data: {
          ...problem(400, "VALIDATION_FAILED"),
          errors: [
            { field: "name", message: "Nome curto" },
            { field: "age", message: "Idade inválida" },
          ],
        },
      }),
    );

    expect(result.current.errors.name?.message).toBe("Nome curto");
    expect(result.current.errors.root).toBeUndefined();
  });

  it("puts a refusal tied to a field on that field", () => {
    const { result }: RenderHookResult<RenderedForm, unknown> = renderForm();

    act((): void =>
      result.current.show({ status: 422, data: problem(422, "UNKNOWN_KIND", "Tipo inexistente") }),
    );

    expect(result.current.errors.kind?.message).toBe("Tipo inexistente");
  });

  it("shows any other refusal above the form", () => {
    const { result }: RenderHookResult<RenderedForm, unknown> = renderForm();

    act((): void =>
      result.current.show({ status: 500, data: problem(500, "INTERNAL_ERROR", "Erro inesperado") }),
    );

    expect(result.current.errors.root?.message).toBe("Erro inesperado");
  });

  it("leaves a rate-limited refusal to the app-wide notice", () => {
    const { result }: RenderHookResult<RenderedForm, unknown> = renderForm();

    act((): void => result.current.show({ status: 429, data: problem(429, "RATE_LIMITED") }));

    expect(result.current.errors).toEqual({});
  });
});
