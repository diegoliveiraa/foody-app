import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { Category } from "@/@types/catalog";
import type { MeResponse, ScreenAction } from "@/@types/me";
import { meApi } from "@/services/me";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { CATEGORY_DIALOGS } from "../constants";
import type { CategoryActionsModel, CategoryDialogTarget } from "../types";
import { useCategoryActions } from "./use-category-actions";

type ToastMock = Mock & { success: Mock; error: Mock };

type ActionsHook = RenderHookResult<CategoryActionsModel, unknown>;

const toast: ToastMock = vi.hoisted((): ToastMock =>
  Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
);

vi.mock("sonner", () => ({ toast }));

const IN_USE_DETAIL: string = "A categoria ainda tem produtos; desabilite-a em vez de excluir";

const LANCHES: Category = {
  id: "0199f2a0-0000-7000-8000-0000000000c1",
  name: "Lanches",
  displayOrder: 1,
  status: "ACTIVE",
  productCount: 3,
  disabledAt: null,
};

function staffMe(actions: ScreenAction[]): MeResponse {
  return {
    user: { id: "staff-1", name: "Bruno", email: "bruno@foody.dev" },
    modules: [
      {
        key: "catalog",
        label: "Catálogo",
        screens: [{ key: "catalog.categories", label: "Categorias", actions }],
      },
    ],
  };
}

async function renderActions(
  edit: (category: Category) => void = vi.fn(),
  actions: ScreenAction[] = ["CREATE", "UPDATE", "DISABLE", "DELETE"],
): Promise<ActionsHook> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(staffMe(actions))));
  await store.dispatch(meApi.endpoints.getMe.initiate());
  return renderHook((): CategoryActionsModel => useCategoryActions(edit), {
    wrapper: withStore(store),
  });
}

function countDisables(): string[] {
  const calls: string[] = [];
  server.use(
    http.post(apiUrl(`/catalog/categories/${LANCHES.id}/disable`), () => {
      calls.push(LANCHES.id);
      return HttpResponse.json({ ...LANCHES, status: "DISABLED" });
    }),
  );
  return calls;
}

function refuseDelete(): void {
  server.use(
    http.delete(apiUrl(`/catalog/categories/${LANCHES.id}`), () =>
      HttpResponse.json(problem(409, "CATEGORY_IN_USE", IN_USE_DETAIL), { status: 409 }),
    ),
  );
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useCategoryActions", () => {
  it("offers only the actions /me grants on the categories screen", async () => {
    const { result }: ActionsHook = await renderActions(vi.fn(), ["UPDATE"]);

    await waitFor((): void => expect(result.current.row.canEdit).toBe(true));
    expect(result.current.row).toMatchObject({ canChangeStatus: false, canDelete: false });
  });

  it("hands the category to the form when asked to edit it", async () => {
    const edit: Mock<(category: Category) => void> = vi.fn();
    const { result }: ActionsHook = await renderActions(edit);

    act((): void => result.current.row.edit(LANCHES));

    expect(edit).toHaveBeenCalledWith(LANCHES);
  });

  it("disables a category only after confirmation, then says so and closes the dialog", async () => {
    const calls: string[] = countDisables();
    const { result }: ActionsHook = await renderActions();

    act((): void => result.current.row.disable(LANCHES));
    const beforeConfirming: string[] = [...calls];
    const dialog: CategoryDialogTarget["dialog"] | undefined = result.current.target?.dialog;
    act((): void => result.current.confirmDisable());

    expect(beforeConfirming).toEqual([]);
    expect(dialog).toBe(CATEGORY_DIALOGS.DISABLE);
    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Categoria desabilitada: Lanches"),
    );
    expect(calls).toEqual([LANCHES.id]);
    expect(result.current.target?.open).toBe(false);
  });

  it("enables a category at once and says so", async () => {
    server.use(
      http.post(apiUrl(`/catalog/categories/${LANCHES.id}/enable`), () =>
        HttpResponse.json(LANCHES),
      ),
    );
    const { result }: ActionsHook = await renderActions();

    act((): void => result.current.row.enable({ ...LANCHES, status: "DISABLED" }));

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Categoria habilitada: Lanches"),
    );
    expect(result.current.target).toBeNull();
  });

  it("deletes after confirmation, says so and closes the dialog", async () => {
    server.use(
      http.delete(
        apiUrl(`/catalog/categories/${LANCHES.id}`),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const { result }: ActionsHook = await renderActions();

    act((): void => result.current.row.remove(LANCHES));
    act((): void => result.current.confirmDelete());

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Categoria excluída: Lanches"),
    );
    expect(result.current.target?.open).toBe(false);
  });

  it("keeps the dialog open with the API's reason when the category still has products", async () => {
    refuseDelete();
    const { result }: ActionsHook = await renderActions();

    act((): void => result.current.row.remove(LANCHES));
    act((): void => result.current.confirmDelete());

    await waitFor((): void => expect(result.current.target?.error).toBe(IN_USE_DETAIL));
    expect(result.current.target?.open).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("disables the category instead once the delete was refused", async () => {
    refuseDelete();
    const calls: string[] = countDisables();
    const { result }: ActionsHook = await renderActions();
    act((): void => result.current.row.remove(LANCHES));
    act((): void => result.current.confirmDelete());
    await waitFor((): void => expect(result.current.target?.error).toBe(IN_USE_DETAIL));

    act((): void => result.current.disableInstead());

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Categoria desabilitada: Lanches"),
    );
    expect(calls).toEqual([LANCHES.id]);
    expect(result.current.target?.open).toBe(false);
  });
});
