import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse, type JsonBodyType } from "msw";
import type { FormEvent } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { MeResponse, ScreenAction } from "@/@types/me";
import type { StaffOrderSummary } from "@/@types/orders";
import { meApi } from "@/services/me";
import { tokenReceived } from "@/store/slices/session";
import { staffOrder, staffSummary } from "@/test/orders";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { OrderActionsModel } from "../types";
import { useOrderActions } from "./use-order-actions";

type ToastMock = Mock & { success: Mock; error: Mock };

const toast: ToastMock = vi.hoisted((): ToastMock =>
  Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
);

vi.mock("sonner", () => ({ toast }));

const ALL_GRANTS: ScreenAction[] = ["UPDATE_STATUS", "CANCEL", "DECIDE_CANCELLATION"];

const RECEIVED: StaffOrderSummary = staffSummary(1043);

const SUBMIT_EVENT: FormEvent<HTMLFormElement> = {
  preventDefault: (): void => {},
  persist: (): void => {},
} as unknown as FormEvent<HTMLFormElement>;

function staffMe(actions: ScreenAction[]): MeResponse {
  return {
    user: { id: "0199f2a0-0000-7000-8000-000000000002", name: "Bruno", email: "bruno@foody.dev" },
    modules: [
      {
        key: "orders",
        label: "Pedidos",
        screens: [{ key: "orders.order-list", label: "Pedidos", actions }],
      },
    ],
  };
}

async function renderActions(
  order: StaffOrderSummary = RECEIVED,
  actions: ScreenAction[] = ALL_GRANTS,
): Promise<RenderHookResult<OrderActionsModel, unknown>> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(staffMe(actions))));
  await store.dispatch(meApi.endpoints.getMe.initiate());
  return renderHook(() => useOrderActions(order), { wrapper: withStore(store) });
}

function recordWrites(
  method: "patch" | "post",
  path: string,
  answer: JsonBodyType,
  status: number = 200,
): unknown[] {
  const bodies: unknown[] = [];
  server.use(
    http[method](apiUrl(path), async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(answer, { status });
    }),
  );
  return bodies;
}

async function cancelWith(
  result: RenderHookResult<OrderActionsModel, unknown>["result"],
  reason: string,
  note: string,
): Promise<void> {
  act((): void => result.current.cancelDialog.show());
  act((): void => {
    result.current.cancelDialog.form.setValue("reason", reason);
    result.current.cancelDialog.form.setValue("note", note);
  });
  await act(async (): Promise<void> => {
    result.current.cancelDialog.submit(SUBMIT_EVENT);
    await Promise.resolve();
  });
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useOrderActions", () => {
  it("offers the next step and the cancellation that /me grants and the order allows", async () => {
    const { result }: RenderHookResult<OrderActionsModel, unknown> = await renderActions();

    await waitFor((): void => expect(result.current.nextStep?.label).toBe("Iniciar preparo"));
    expect(result.current.canCancel).toBe(true);
  });

  it("offers nothing that /me does not grant", async () => {
    const { result }: RenderHookResult<OrderActionsModel, unknown> = await renderActions(
      RECEIVED,
      [],
    );

    expect(result.current.nextStep).toBeNull();
    expect(result.current.canCancel).toBe(false);
  });

  it("offers nothing the API does not allow for the order", async () => {
    const { result }: RenderHookResult<OrderActionsModel, unknown> = await renderActions(
      staffSummary(1031, { status: "DELIVERED", live: false }),
    );

    expect(result.current.nextStep).toBeNull();
    expect(result.current.canCancel).toBe(false);
  });

  it("moves the order to the status the API allows and says so", async () => {
    const bodies: unknown[] = recordWrites(
      "patch",
      `/orders/${RECEIVED.id}/status`,
      staffOrder(1043, { status: "PREPARING" }),
    );
    const { result }: RenderHookResult<OrderActionsModel, unknown> = await renderActions();
    await waitFor((): void => expect(result.current.nextStep).not.toBeNull());

    act((): void => result.current.advance());

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Pedido #1043 em preparo"),
    );
    expect(bodies).toEqual([{ status: "PREPARING" }]);
  });

  it("shows the API's detail when the order had already moved", async () => {
    recordWrites(
      "patch",
      `/orders/${RECEIVED.id}/status`,
      problem(422, "INVALID_STATUS_TRANSITION", "O pedido não pode ir para esse status agora"),
      422,
    );
    const { result }: RenderHookResult<OrderActionsModel, unknown> = await renderActions();
    await waitFor((): void => expect(result.current.nextStep).not.toBeNull());

    act((): void => result.current.advance());

    await waitFor((): void =>
      expect(toast.error).toHaveBeenCalledWith("O pedido não pode ir para esse status agora"),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("cancels with the reason and the note, says so and closes the dialog", async () => {
    const bodies: unknown[] = recordWrites(
      "post",
      `/orders/${RECEIVED.id}/cancel`,
      staffOrder(1043, { status: "CANCELLED", live: false }),
    );
    const { result }: RenderHookResult<OrderActionsModel, unknown> = await renderActions();

    await cancelWith(result, "STORE_CLOSED", " Gás acabou ");

    await waitFor((): void => expect(toast.success).toHaveBeenCalledWith("Pedido #1043 cancelado"));
    expect(bodies).toEqual([{ reason: "STORE_CLOSED", note: "Gás acabou" }]);
    expect(result.current.cancelDialog.open).toBe(false);
  });

  it("keeps the dialog open with the API's demand for a note on the note field", async () => {
    recordWrites(
      "post",
      `/orders/${RECEIVED.id}/cancel`,
      {
        ...problem(400, "VALIDATION_FAILED", "Dados inválidos"),
        errors: [{ field: "note", message: "Conte o motivo do cancelamento na observação" }],
      },
      400,
    );
    const { result }: RenderHookResult<OrderActionsModel, unknown> = await renderActions();

    await cancelWith(result, "STORE_CLOSED", "");

    await waitFor((): void =>
      expect(result.current.cancelDialog.form.getFieldState("note").error?.message).toBe(
        "Conte o motivo do cancelamento na observação",
      ),
    );
    expect(result.current.cancelDialog.open).toBe(true);
  });

  it("closes the dialog and shows the API's detail when the order can no longer be cancelled", async () => {
    recordWrites(
      "post",
      `/orders/${RECEIVED.id}/cancel`,
      problem(409, "CONCURRENT_UPDATE", "O registro foi alterado por outra operação"),
      409,
    );
    const { result }: RenderHookResult<OrderActionsModel, unknown> = await renderActions();

    await cancelWith(result, "STORE_CLOSED", "");

    await waitFor((): void =>
      expect(toast.error).toHaveBeenCalledWith("O registro foi alterado por outra operação"),
    );
    expect(result.current.cancelDialog.open).toBe(false);
  });
});
