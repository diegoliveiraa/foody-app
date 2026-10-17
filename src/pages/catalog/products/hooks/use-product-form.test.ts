import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { FormEvent } from "react";
import type { FieldErrors } from "react-hook-form";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { Product } from "@/@types/catalog";
import type { MeResponse, ScreenAction } from "@/@types/me";
import { meApi } from "@/services/me";
import type { ProductFormInput } from "@/services/validation-schemas/product";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { ProductFormModel } from "../types";
import { useProductForm } from "./use-product-form";

type ToastMock = Mock & { success: Mock; error: Mock };

const toast: ToastMock = vi.hoisted((): ToastMock =>
  Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
);

vi.mock("sonner", () => ({ toast }));

const LANCHES_ID: string = "0199f2a0-0000-7000-8000-0000000000c1";

const SMASH: Product = {
  id: "0199f2a0-0000-7000-8000-0000000000a1",
  name: "Smash duplo",
  description: null,
  price: 34.9,
  category: { id: LANCHES_ID, name: "Lanches" },
  status: "ACTIVE",
  createdAt: "2026-03-04T15:00:00Z",
  disabledAt: null,
};

const TYPED: ProductFormInput = {
  name: "Smash duplo",
  description: "",
  price: "34,90",
  categoryId: LANCHES_ID,
};

const SUBMIT_EVENT: FormEvent<HTMLFormElement> = {
  preventDefault: (): void => {},
  persist: (): void => {},
} as unknown as FormEvent<HTMLFormElement>;

interface RenderedForm {
  model: ProductFormModel;
  errors: FieldErrors<ProductFormInput>;
}

type FormHook = RenderHookResult<RenderedForm, unknown>;

function useRenderedForm(): RenderedForm {
  const model: ProductFormModel = useProductForm();
  return { model, errors: model.form.formState.errors };
}

function staffMe(actions: ScreenAction[]): MeResponse {
  return {
    user: { id: "staff-1", name: "Bruno", email: "bruno@foody.dev" },
    modules: [
      {
        key: "catalog",
        label: "Catálogo",
        screens: [{ key: "catalog.products", label: "Produtos", actions }],
      },
    ],
  };
}

async function renderForm(actions: ScreenAction[] = ["CREATE", "UPDATE"]): Promise<FormHook> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(staffMe(actions))));
  await store.dispatch(meApi.endpoints.getMe.initiate());
  return renderHook(useRenderedForm, { wrapper: withStore(store) });
}

function recordBodies(method: "post" | "put", path: string, answer: Product): unknown[] {
  const bodies: unknown[] = [];
  server.use(
    http[method](apiUrl(path), async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(answer);
    }),
  );
  return bodies;
}

async function fillAndSubmit(result: FormHook["result"], values: ProductFormInput): Promise<void> {
  act((): void => result.current.model.form.reset(values));
  await act(async (): Promise<void> => {
    result.current.model.submit(SUBMIT_EVENT);
    await Promise.resolve();
  });
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useProductForm", () => {
  it("offers creating a product only when /me grants it", async () => {
    const granted: FormHook = await renderForm();
    const refused: FormHook = await renderForm(["UPDATE"]);

    await waitFor((): void => expect(granted.result.current.model.canCreate).toBe(true));
    expect(refused.result.current.model.canCreate).toBe(false);
  });

  it("opens an empty form to create a product", async () => {
    const { result }: FormHook = await renderForm();

    act((): void => result.current.model.openCreate());

    expect(result.current.model.open).toBe(true);
    expect(result.current.model.editing).toBeNull();
    expect(result.current.model.form.getValues()).toEqual({
      name: "",
      description: "",
      price: "",
      categoryId: "",
    });
  });

  it("opens the form filled with the product to edit, its price typed the Brazilian way", async () => {
    const { result }: FormHook = await renderForm();

    act((): void => result.current.model.openEdit(SMASH));

    expect(result.current.model.editing).toEqual(SMASH);
    expect(result.current.model.form.getValues()).toMatchObject({
      price: "34,90",
      description: "",
    });
  });

  it("creates the product with the typed price as a number, says so and closes", async () => {
    const bodies: unknown[] = recordBodies("post", "/catalog/products", SMASH);
    const { result }: FormHook = await renderForm();
    act((): void => result.current.model.openCreate());

    await fillAndSubmit(result, TYPED);

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Produto criado: Smash duplo"),
    );
    expect(bodies).toEqual([
      { name: "Smash duplo", description: null, price: 34.9, categoryId: LANCHES_ID },
    ]);
    expect(result.current.model.open).toBe(false);
  });

  it("saves the edited product with a PUT, says so and closes", async () => {
    const bodies: unknown[] = recordBodies("put", `/catalog/products/${SMASH.id}`, {
      ...SMASH,
      price: 36.5,
    });
    const { result }: FormHook = await renderForm();
    act((): void => result.current.model.openEdit(SMASH));

    await fillAndSubmit(result, { ...TYPED, price: "36.5", description: " Pão brioche " });

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Produto atualizado: Smash duplo"),
    );
    expect(bodies).toEqual([
      { name: "Smash duplo", description: "Pão brioche", price: 36.5, categoryId: LANCHES_ID },
    ]);
    expect(result.current.model.open).toBe(false);
  });

  it("puts the API's field messages on their fields and keeps the form open", async () => {
    server.use(
      http.post(apiUrl("/catalog/products"), () =>
        HttpResponse.json(
          {
            ...problem(400, "VALIDATION_FAILED", "Há campos inválidos"),
            errors: [{ field: "price", message: "Preço fora do limite" }],
          },
          { status: 400 },
        ),
      ),
    );
    const { result }: FormHook = await renderForm();
    act((): void => result.current.model.openCreate());

    await fillAndSubmit(result, TYPED);

    await waitFor((): void =>
      expect(result.current.errors.price?.message).toBe("Preço fora do limite"),
    );
    expect(result.current.model.open).toBe(true);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("shows an unknown category on the category field", async () => {
    server.use(
      http.post(apiUrl("/catalog/products"), () =>
        HttpResponse.json(problem(422, "UNKNOWN_CATEGORY", "Categoria informada não existe"), {
          status: 422,
        }),
      ),
    );
    const { result }: FormHook = await renderForm();
    act((): void => result.current.model.openCreate());

    await fillAndSubmit(result, TYPED);

    await waitFor((): void =>
      expect(result.current.errors.categoryId?.message).toBe("Categoria informada não existe"),
    );
  });

  it("shows any other refusal above the form", async () => {
    server.use(
      http.post(apiUrl("/catalog/products"), () =>
        HttpResponse.json(problem(500, "INTERNAL_ERROR", "Erro inesperado"), { status: 500 }),
      ),
    );
    const { result }: FormHook = await renderForm();
    act((): void => result.current.model.openCreate());

    await fillAndSubmit(result, TYPED);

    await waitFor((): void => expect(result.current.errors.root?.message).toBe("Erro inesperado"));
    expect(result.current.model.open).toBe(true);
  });
});
