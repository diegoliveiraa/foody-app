import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { FormEvent } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { MeResponse } from "@/@types/me";
import type { AdminUser } from "@/@types/users";
import { meApi } from "@/services/me";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { USER_DIALOGS } from "../constants";
import type { UserActionsModel } from "../types";
import { useUserActions } from "./use-user-actions";

type ToastMock = Mock & { success: Mock; error: Mock };

const toast: ToastMock = vi.hoisted((): ToastMock =>
  Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
);

vi.mock("sonner", () => ({ toast }));

const ADMIN_ID: string = "0199f2a0-0000-7000-8000-000000000003";

const BRUNO: AdminUser = {
  id: "0199f2a0-0000-7000-8000-00000000000b",
  name: "Bruno Lima",
  email: "bruno@foody.dev",
  role: "CUSTOMER",
  status: "ACTIVE",
  createdAt: "2026-02-10T15:00:00Z",
  disabledAt: null,
};

function adminMe(actions: MeResponse["modules"][number]["screens"][number]["actions"]): MeResponse {
  return {
    user: { id: ADMIN_ID, name: "Carla Mendes", email: "carla@foody.dev" },
    modules: [
      {
        key: "admin",
        label: "Administração",
        screens: [{ key: "admin.users", label: "Usuários", actions }],
      },
    ],
  };
}

const SUBMIT_EVENT: FormEvent<HTMLFormElement> = {
  preventDefault: (): void => {},
  persist: (): void => {},
} as unknown as FormEvent<HTMLFormElement>;

async function renderActions(
  me: MeResponse = adminMe(["UPDATE", "DISABLE"]),
): Promise<RenderHookResult<UserActionsModel, unknown>> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(me)));
  await store.dispatch(meApi.endpoints.getMe.initiate());
  return renderHook(useUserActions, { wrapper: withStore(store) });
}

async function chooseStaffFor(
  result: RenderHookResult<UserActionsModel, unknown>["result"],
): Promise<void> {
  act((): void => result.current.row.changeRole(BRUNO));
  act((): void => {
    result.current.roleForm.setValue("role", "STAFF", { shouldDirty: true });
  });
  await act(async (): Promise<void> => {
    result.current.submitRole(SUBMIT_EVENT);
    await Promise.resolve();
  });
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useUserActions", () => {
  it("offers changing the role and the status that /me grants, knowing who is signed in", async () => {
    const { result }: RenderHookResult<UserActionsModel, unknown> = await renderActions();

    await waitFor((): void => expect(result.current.row.currentUserId).toBe(ADMIN_ID));
    expect(result.current.row.canChangeRole).toBe(true);
    expect(result.current.row.canChangeStatus).toBe(true);
  });

  it("offers no action that /me does not grant", async () => {
    const { result }: RenderHookResult<UserActionsModel, unknown> = await renderActions(
      adminMe([]),
    );

    await waitFor((): void => expect(result.current.row.currentUserId).toBe(ADMIN_ID));
    expect(result.current.row.canChangeRole).toBe(false);
    expect(result.current.row.canChangeStatus).toBe(false);
  });

  it("opens the role dialog on the user's current role", async () => {
    const { result }: RenderHookResult<UserActionsModel, unknown> = await renderActions();

    act((): void => result.current.row.changeRole(BRUNO));

    expect(result.current.target).toEqual({ dialog: USER_DIALOGS.ROLE, user: BRUNO, open: true });
    expect(result.current.roleForm.getValues()).toEqual({ role: "CUSTOMER" });
  });

  it("confirms the new role in a toast and closes the dialog", async () => {
    server.use(
      http.patch(apiUrl(`/admin/users/${BRUNO.id}/role`), () =>
        HttpResponse.json({ ...BRUNO, role: "STAFF" }),
      ),
    );
    const { result }: RenderHookResult<UserActionsModel, unknown> = await renderActions();

    await chooseStaffFor(result);

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Papel alterado: Bruno Lima agora é Equipe"),
    );
    expect(result.current.target?.open).toBe(false);
  });

  it("shows the API's detail and keeps the dialog open when the change is refused", async () => {
    server.use(
      http.patch(apiUrl(`/admin/users/${BRUNO.id}/role`), () =>
        HttpResponse.json(
          problem(422, "LAST_ACTIVE_ADMIN", "É preciso manter ao menos um administrador ativo"),
          { status: 422 },
        ),
      ),
    );
    const { result }: RenderHookResult<UserActionsModel, unknown> = await renderActions();

    await chooseStaffFor(result);

    await waitFor((): void =>
      expect(toast.error).toHaveBeenCalledWith("É preciso manter ao menos um administrador ativo"),
    );
    expect(result.current.target?.open).toBe(true);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("leaves a rate-limited refusal to the app-wide notice instead of a second toast", async () => {
    server.use(
      http.post(apiUrl(`/admin/users/${BRUNO.id}/enable`), () =>
        HttpResponse.json(problem(429, "RATE_LIMITED"), { status: 429 }),
      ),
    );
    const { result }: RenderHookResult<UserActionsModel, unknown> = await renderActions();

    act((): void => result.current.row.enable(BRUNO));

    await waitFor((): void => expect(toast).toHaveBeenCalledTimes(1));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("disables only after confirmation, then says so and closes the dialog", async () => {
    const disabled: string[] = [];
    server.use(
      http.post(apiUrl(`/admin/users/${BRUNO.id}/disable`), () => {
        disabled.push(BRUNO.id);
        return HttpResponse.json({ ...BRUNO, status: "DISABLED" });
      }),
    );
    const { result }: RenderHookResult<UserActionsModel, unknown> = await renderActions();

    act((): void => result.current.row.disable(BRUNO));
    const beforeConfirming: string[] = [...disabled];
    act((): void => result.current.confirmDisable());

    expect(beforeConfirming).toEqual([]);
    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Usuário desabilitado: Bruno Lima"),
    );
    expect(disabled).toEqual([BRUNO.id]);
    expect(result.current.target?.open).toBe(false);
  });

  it("enables without asking and says so", async () => {
    server.use(
      http.post(apiUrl(`/admin/users/${BRUNO.id}/enable`), () => HttpResponse.json(BRUNO)),
    );
    const { result }: RenderHookResult<UserActionsModel, unknown> = await renderActions();

    act((): void => result.current.row.enable({ ...BRUNO, status: "DISABLED" }));

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Usuário habilitado: Bruno Lima"),
    );
    expect(result.current.target).toBeNull();
  });
});
