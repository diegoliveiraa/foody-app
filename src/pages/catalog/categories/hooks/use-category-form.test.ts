import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { FormEvent } from "react";
import type { FieldErrors } from "react-hook-form";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { Category } from "@/@types/catalog";
import type { MeResponse } from "@/@types/me";
import { meApi } from "@/services/me";
import type { CategoryFormInput } from "@/services/validation-schemas/category";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { CategoryFormModel } from "../types";
import { useCategoryForm } from "./use-category-form";

type ToastMock = Mock & { success: Mock; error: Mock };

interface RenderedForm {
  model: CategoryFormModel;
  errors: FieldErrors<CategoryFormInput>;
}

type FormHook = RenderHookResult<RenderedForm, unknown>;

const toast: ToastMock = vi.hoisted((): ToastMock =>
  Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
);

vi.mock("sonner", () => ({ toast }));

const NAME_TAKEN_DETAIL: string = "Já existe uma categoria com esse nome";

const LANCHES: Category = {
  id: "0199f2a0-0000-7000-8000-0000000000c1",
  name: "Lanches",
  displayOrder: 1,
  status: "ACTIVE",
  productCount: 3,
  disabledAt: null,
};

const PIZZAS: Category = { ...LANCHES, id: "c2", name: "Pizzas", displayOrder: 4 };

const STAFF: MeResponse = {
  user: { id: "staff-1", name: "Bruno", email: "bruno@foody.dev" },
  modules: [
    {
      key: "catalog",
      label: "Catálogo",
      screens: [{ key: "catalog.categories", label: "Categorias", actions: ["CREATE", "UPDATE"] }],
    },
  ],
};

const SUBMIT_EVENT: FormEvent<HTMLFormElement> = {
  preventDefault: (): void => {},
  persist: (): void => {},
} as unknown as FormEvent<HTMLFormElement>;

async function renderForm(categories: readonly Category[] = [LANCHES, PIZZAS]): Promise<FormHook> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(STAFF)));
  await store.dispatch(meApi.endpoints.getMe.initiate());
  return renderHook(
    (): RenderedForm => {
      const model: CategoryFormModel = useCategoryForm(categories);
      return { model, errors: model.form.formState.errors };
    },
    { wrapper: withStore(store) },
  );
}

async function fillAndSubmit(result: FormHook["result"], values: CategoryFormInput): Promise<void> {
  act((): void => result.current.model.form.reset(values));
  await act(async (): Promise<void> => {
    result.current.model.submit(SUBMIT_EVENT);
    await Promise.resolve();
  });
}

function recordBodies(method: "post" | "put", path: string, answer: Category): unknown[] {
  const bodies: unknown[] = [];
  server.use(
    http[method](apiUrl(path), async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(answer);
    }),
  );
  return bodies;
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useCategoryForm", () => {
  it("opens a new category placed right after the last one", async () => {
    const { result }: FormHook = await renderForm();

    act((): void => result.current.model.openCreate());

    expect(result.current.model.open).toBe(true);
    expect(result.current.model.form.getValues()).toEqual({ name: "", displayOrder: "5" });
    await waitFor((): void => expect(result.current.model.canCreate).toBe(true));
  });

  it("opens the form filled with the category to edit", async () => {
    const { result }: FormHook = await renderForm();

    act((): void => result.current.model.openEdit(LANCHES));

    expect(result.current.model.editing).toEqual(LANCHES);
    expect(result.current.model.form.getValues()).toEqual({ name: "Lanches", displayOrder: "1" });
  });

  it("creates the category with a numeric display order, says so and closes", async () => {
    const bodies: unknown[] = recordBodies("post", "/catalog/categories", {
      ...LANCHES,
      name: "Bebidas",
    });
    const { result }: FormHook = await renderForm();
    act((): void => result.current.model.openCreate());

    await fillAndSubmit(result, { name: " Bebidas ", displayOrder: "5" });

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Categoria criada: Bebidas"),
    );
    expect(bodies).toEqual([{ name: "Bebidas", displayOrder: 5 }]);
    expect(result.current.model.open).toBe(false);
  });

  it("saves the edited category with a PUT and says so", async () => {
    const bodies: unknown[] = recordBodies("put", `/catalog/categories/${LANCHES.id}`, {
      ...LANCHES,
      name: "Sanduíches",
    });
    const { result }: FormHook = await renderForm();
    act((): void => result.current.model.openEdit(LANCHES));

    await fillAndSubmit(result, { name: "Sanduíches", displayOrder: "2" });

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Categoria atualizada: Sanduíches"),
    );
    expect(bodies).toEqual([{ name: "Sanduíches", displayOrder: 2 }]);
  });

  it("shows a name already in use on the name field and keeps the dialog open", async () => {
    server.use(
      http.post(apiUrl("/catalog/categories"), () =>
        HttpResponse.json(problem(409, "CATEGORY_NAME_TAKEN", NAME_TAKEN_DETAIL), {
          status: 409,
        }),
      ),
    );
    const { result }: FormHook = await renderForm();
    act((): void => result.current.model.openCreate());

    await fillAndSubmit(result, { name: "Lanches", displayOrder: "5" });

    await waitFor((): void => expect(result.current.errors.name?.message).toBe(NAME_TAKEN_DETAIL));
    expect(result.current.model.open).toBe(true);
  });

  it("shows any other refusal above the form", async () => {
    server.use(
      http.post(apiUrl("/catalog/categories"), () =>
        HttpResponse.json(problem(500, "INTERNAL_ERROR", "Erro inesperado"), { status: 500 }),
      ),
    );
    const { result }: FormHook = await renderForm();
    act((): void => result.current.model.openCreate());

    await fillAndSubmit(result, { name: "Bebidas", displayOrder: "5" });

    await waitFor((): void => expect(result.current.errors.root?.message).toBe("Erro inesperado"));
  });
});
