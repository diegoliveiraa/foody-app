import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import type { FormEvent } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { problem } from "@/test/problems";
import { useOrderFormSubmit } from "./use-order-form-submit";

interface NoteValues {
  note: string;
}

interface RenderedSubmit {
  form: UseFormReturn<NoteValues>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

type ToastMock = Mock & { error: Mock };

const toast: ToastMock = vi.hoisted((): ToastMock => Object.assign(vi.fn(), { error: vi.fn() }));

vi.mock("sonner", () => ({ toast }));

const NOTE_FIELDS: readonly (keyof NoteValues)[] = ["note"];

const SUBMIT_EVENT: FormEvent<HTMLFormElement> = {
  preventDefault: (): void => {},
  persist: (): void => {},
} as unknown as FormEvent<HTMLFormElement>;

function renderSubmit(
  send: (values: NoteValues) => Promise<void>,
  close: () => void,
): RenderHookResult<RenderedSubmit, unknown> {
  return renderHook((): RenderedSubmit => {
    const form: UseFormReturn<NoteValues> = useForm<NoteValues>({ defaultValues: { note: "" } });
    const submit: (event: FormEvent<HTMLFormElement>) => void = useOrderFormSubmit(
      form,
      NOTE_FIELDS,
      send,
      close,
    );
    return { form, submit };
  });
}

async function submitWith(
  result: RenderHookResult<RenderedSubmit, unknown>["result"],
): Promise<void> {
  await act(async (): Promise<void> => {
    result.current.submit(SUBMIT_EVENT);
    await Promise.resolve();
  });
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useOrderFormSubmit", () => {
  it("sends the form's values", async () => {
    const send: Mock = vi.fn(async (): Promise<void> => {});
    const close: Mock = vi.fn();
    const { result }: RenderHookResult<RenderedSubmit, unknown> = renderSubmit(send, close);

    await submitWith(result);

    expect(send).toHaveBeenCalledWith({ note: "" }, expect.anything());
    expect(close).not.toHaveBeenCalled();
  });

  it("shows the API's detail and closes when the order changed meanwhile", async () => {
    const close: Mock = vi.fn();
    const { result }: RenderHookResult<RenderedSubmit, unknown> = renderSubmit(
      async (): Promise<void> => {
        throw {
          status: 409,
          data: problem(409, "CONCURRENT_UPDATE", "Alterado por outra operação"),
        };
      },
      close,
    );

    await submitWith(result);

    await vi.waitFor((): void =>
      expect(toast.error).toHaveBeenCalledWith("Alterado por outra operação"),
    );
    expect(close).toHaveBeenCalledOnce();
  });

  it("puts a field error on its field and keeps the form open", async () => {
    const close: Mock = vi.fn();
    const { result }: RenderHookResult<RenderedSubmit, unknown> = renderSubmit(
      async (): Promise<void> => {
        throw {
          status: 400,
          data: {
            ...problem(400, "VALIDATION_FAILED"),
            errors: [{ field: "note", message: "Conte o motivo do cancelamento na observação" }],
          },
        };
      },
      close,
    );

    await submitWith(result);

    await vi.waitFor((): void =>
      expect(result.current.form.getFieldState("note").error?.message).toBe(
        "Conte o motivo do cancelamento na observação",
      ),
    );
    expect(close).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
