import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { Product } from "@/@types/catalog";
import type { MeResponse, ScreenAction } from "@/@types/me";
import { meApi } from "@/services/me";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { PRODUCT_DIALOGS } from "../constants";
import type { ProductActionsModel } from "../types";
import { useProductActions } from "./use-product-actions";

type ToastMock = Mock & { success: Mock; error: Mock };

type ActionsHook = RenderHookResult<ProductActionsModel, unknown>;

const toast: ToastMock = vi.hoisted((): ToastMock =>
  Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
);

vi.mock("sonner", () => ({ toast }));

const IN_USE_DETAIL: string = "O produto já está em pedidos; desabilite-o em vez de excluir";

const SMASH: Product = {
  id: "0199f2a0-0000-7000-8000-0000000000a1",
  name: "Smash duplo",
  description: null,
  price: 34.9,
  category: { id: "0199f2a0-0000-7000-8000-0000000000c1", name: "Lanches" },
  status: "ACTIVE",
  createdAt: "2026-03-04T15:00:00Z",
  disabledAt: null,
};

const ALL_ACTIONS: ScreenAction[] = ["CREATE", "UPDATE", "DISABLE", "DELETE"];

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

async function renderActions(
  edit: (product: Product) => void = vi.fn(),
  actions: ScreenAction[] = ALL_ACTIONS,
): Promise<ActionsHook> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(staffMe(actions))));
  await store.dispatch(meApi.endpoints.getMe.initiate());
  return renderHook((): ProductActionsModel => useProductActions(edit), {
    wrapper: withStore(store),
  });
}

function countDisables(): string[] {
  const calls: string[] = [];
  server.use(
    http.post(apiUrl(`/catalog/products/${SMASH.id}/disable`), () => {
      calls.push(SMASH.id);
      return HttpResponse.json({ ...SMASH, status: "DISABLED" });
    }),
  );
  return calls;
}

function refuseDeleteWith(status: number, code: string, detail: string): void {
  server.use(
    http.delete(apiUrl(`/catalog/products/${SMASH.id}`), () =>
      HttpResponse.json(problem(status, code, detail), { status }),
    ),
  );
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useProductActions", () => {
  it("offers the actions /me grants on the products screen", async () => {
    const granted: ActionsHook = await renderActions();
    const editOnly: ActionsHook = await renderActions(vi.fn(), ["UPDATE"]);

    await waitFor((): void => expect(granted.result.current.row.canDelete).toBe(true));
    expect(granted.result.current.row).toMatchObject({ canEdit: true, canChangeStatus: true });
    expect(editOnly.result.current.row).toMatchObject({
      canEdit: true,
      canChangeStatus: false,
      canDelete: false,
    });
  });

  it("hands the product to the form when asked to edit it", async () => {
    const edit: Mock<(product: Product) => void> = vi.fn();
    const { result }: ActionsHook = await renderActions(edit);

    act((): void => result.current.row.edit(SMASH));

    expect(edit).toHaveBeenCalledWith(SMASH);
  });

  it("disables only after confirmation, then says so and closes the dialog", async () => {
    const calls: string[] = countDisables();
    const { result }: ActionsHook = await renderActions();

    act((): void => result.current.row.disable(SMASH));
    const beforeConfirming: string[] = [...calls];
    act((): void => result.current.confirmDisable());

    expect(beforeConfirming).toEqual([]);
    expect(result.current.target?.dialog).toBe(PRODUCT_DIALOGS.DISABLE);
    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Produto desabilitado: Smash duplo"),
    );
    expect(result.current.target?.open).toBe(false);
  });

  it("enables at once and says so", async () => {
    server.use(
      http.post(apiUrl(`/catalog/products/${SMASH.id}/enable`), () => HttpResponse.json(SMASH)),
    );
    const { result }: ActionsHook = await renderActions();

    act((): void => result.current.row.enable({ ...SMASH, status: "DISABLED" }));

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Produto habilitado: Smash duplo"),
    );
    expect(result.current.target).toBeNull();
  });

  it("deletes after confirmation, says so and closes the dialog", async () => {
    server.use(
      http.delete(
        apiUrl(`/catalog/products/${SMASH.id}`),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const { result }: ActionsHook = await renderActions();

    act((): void => result.current.row.remove(SMASH));
    act((): void => result.current.confirmDelete());

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Produto excluído: Smash duplo"),
    );
    expect(result.current.target?.open).toBe(false);
  });

  it("keeps the dialog open with the API's reason when the product cannot be deleted", async () => {
    refuseDeleteWith(409, "PRODUCT_IN_USE", IN_USE_DETAIL);
    const { result }: ActionsHook = await renderActions();

    act((): void => result.current.row.remove(SMASH));
    act((): void => result.current.confirmDelete());

    await waitFor((): void => expect(result.current.target?.error).toBe(IN_USE_DETAIL));
    expect(result.current.target?.open).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("disables the product instead once the delete was refused", async () => {
    refuseDeleteWith(409, "PRODUCT_IN_USE", IN_USE_DETAIL);
    const calls: string[] = countDisables();
    const { result }: ActionsHook = await renderActions();
    act((): void => result.current.row.remove(SMASH));
    act((): void => result.current.confirmDelete());
    await waitFor((): void => expect(result.current.target?.error).toBe(IN_USE_DETAIL));

    act((): void => result.current.disableInstead());

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Produto desabilitado: Smash duplo"),
    );
    expect(calls).toEqual([SMASH.id]);
    expect(result.current.target?.open).toBe(false);
  });

  it("shows any other refusal to delete in a toast", async () => {
    refuseDeleteWith(500, "INTERNAL_ERROR", "Erro inesperado");
    const { result }: ActionsHook = await renderActions();

    act((): void => result.current.row.remove(SMASH));
    act((): void => result.current.confirmDelete());

    await waitFor((): void => expect(toast.error).toHaveBeenCalledWith("Erro inesperado"));
    expect(result.current.target?.error).toBeUndefined();
  });
});
