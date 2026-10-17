import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { FormEvent } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { MeResponse, ScreenAction } from "@/@types/me";
import type { CustomerOrder } from "@/@types/orders";
import { meApi } from "@/services/me";
import { tokenReceived } from "@/store/slices/session";
import { customerOrder } from "@/test/orders";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { CancellationModel } from "../types";
import { useCancellation } from "./use-cancellation";

type ToastMock = Mock & { success: Mock; error: Mock };

const toast: ToastMock = vi.hoisted((): ToastMock =>
  Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
);

vi.mock("sonner", () => ({ toast }));

const RECEIVED: CustomerOrder = customerOrder(1042);

const PREPARING: CustomerOrder = customerOrder(1042, { status: "PREPARING" });

const SUBMIT_EVENT: FormEvent<HTMLFormElement> = {
  preventDefault: (): void => {},
  persist: (): void => {},
} as unknown as FormEvent<HTMLFormElement>;

function customerMe(actions: ScreenAction[]): MeResponse {
  return {
    user: { id: "0199f2a0-0000-7000-8000-000000000001", name: "Ana", email: "ana@foody.dev" },
    modules: [
      {
        key: "store",
        label: "Loja",
        screens: [{ key: "store.my-orders", label: "Pedidos", actions }],
      },
    ],
  };
}

async function renderCancellation(
  order: CustomerOrder,
  actions: ScreenAction[] = ["CANCEL", "REQUEST_CANCELLATION"],
): Promise<RenderHookResult<CancellationModel, unknown>> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(customerMe(actions))));
  await store.dispatch(meApi.endpoints.getMe.initiate());
  return renderHook(() => useCancellation(order), { wrapper: withStore(store) });
}

function recordPosts(path: string, answer: unknown, status: number = 200): unknown[] {
  const bodies: unknown[] = [];
  server.use(
    http.post(apiUrl(path), async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(answer as object, { status });
    }),
  );
  return bodies;
}

async function chooseAndSubmit(
  result: RenderHookResult<CancellationModel, unknown>["result"],
  reason: string,
  note: string = "",
): Promise<void> {
  act((): void => {
    result.current.form.setValue("reason", reason);
    result.current.form.setValue("note", note);
  });
  await act(async (): Promise<void> => {
    result.current.submit(SUBMIT_EVENT);
    await Promise.resolve();
  });
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useCancellation", () => {
  it("offers to cancel a received order and to ask for it once the kitchen started", async () => {
    const received: RenderHookResult<CancellationModel, unknown> =
      await renderCancellation(RECEIVED);
    const preparing: RenderHookResult<CancellationModel, unknown> =
      await renderCancellation(PREPARING);

    await waitFor((): void => expect(received.result.current.state).toBe("cancel"));
    await waitFor((): void => expect(preparing.result.current.state).toBe("request"));
  });

  it("offers nothing when /me grants no cancellation", async () => {
    const { result }: RenderHookResult<CancellationModel, unknown> = await renderCancellation(
      RECEIVED,
      [],
    );

    expect(result.current.state).toBeNull();
  });

  it("opens the sheet with no reason chosen", async () => {
    const { result }: RenderHookResult<CancellationModel, unknown> =
      await renderCancellation(RECEIVED);

    act((): void => result.current.show("cancel"));

    expect(result.current.sheet).toEqual({ mode: "cancel", open: true });
    expect(result.current.form.getValues()).toEqual({ reason: "", note: "" });
  });

  it("cancels with the chosen reason, says so and closes the sheet", async () => {
    const bodies: unknown[] = recordPosts(
      `/my-orders/${RECEIVED.id}/cancel`,
      customerOrder(1042, { status: "CANCELLED", live: false }),
    );
    const { result }: RenderHookResult<CancellationModel, unknown> =
      await renderCancellation(RECEIVED);
    act((): void => result.current.show("cancel"));

    await chooseAndSubmit(result, "CHANGED_MIND");

    await waitFor((): void => expect(toast.success).toHaveBeenCalledWith("Pedido #1042 cancelado"));
    expect(bodies).toEqual([{ reason: "CHANGED_MIND" }]);
    expect(result.current.sheet?.open).toBe(false);
  });

  it("asks the restaurant to cancel with the reason and the note, and says it was sent", async () => {
    const bodies: unknown[] = recordPosts(
      `/my-orders/${PREPARING.id}/cancellation-request`,
      PREPARING,
    );
    const { result }: RenderHookResult<CancellationModel, unknown> =
      await renderCancellation(PREPARING);
    act((): void => result.current.show("request"));

    await chooseAndSubmit(result, "OTHER", " Vou sair de casa ");

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Solicitação enviada ao restaurante"),
    );
    expect(bodies).toEqual([{ reason: "OTHER", note: "Vou sair de casa" }]);
  });

  it("puts the API's demand for a note on the note field and keeps the sheet open", async () => {
    recordPosts(
      `/my-orders/${RECEIVED.id}/cancel`,
      {
        ...problem(400, "VALIDATION_FAILED", "Dados inválidos"),
        errors: [{ field: "note", message: "Conte o motivo do cancelamento na observação" }],
      },
      400,
    );
    const { result }: RenderHookResult<CancellationModel, unknown> =
      await renderCancellation(RECEIVED);
    act((): void => result.current.show("cancel"));

    await chooseAndSubmit(result, "CHANGED_MIND");

    await waitFor((): void =>
      expect(result.current.form.getFieldState("note").error?.message).toBe(
        "Conte o motivo do cancelamento na observação",
      ),
    );
    expect(result.current.sheet?.open).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows the API's detail and closes the sheet when the order changed meanwhile", async () => {
    recordPosts(
      `/my-orders/${RECEIVED.id}/cancel`,
      problem(422, "CANCELLATION_NOT_ALLOWED", "Este pedido não pode ser cancelado agora"),
      422,
    );
    server.use(http.get(apiUrl(`/my-orders/${RECEIVED.id}`), () => HttpResponse.json(PREPARING)));
    const { result }: RenderHookResult<CancellationModel, unknown> =
      await renderCancellation(RECEIVED);
    act((): void => result.current.show("cancel"));

    await chooseAndSubmit(result, "CHANGED_MIND");

    await waitFor((): void =>
      expect(toast.error).toHaveBeenCalledWith("Este pedido não pode ser cancelado agora"),
    );
    expect(result.current.sheet?.open).toBe(false);
  });
});
