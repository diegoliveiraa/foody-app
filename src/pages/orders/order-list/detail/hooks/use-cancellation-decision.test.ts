import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse, type JsonBodyType } from "msw";
import type { FormEvent } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { MeResponse, ScreenAction } from "@/@types/me";
import type { StaffCancellationRequest, StaffOrder } from "@/@types/orders";
import { meApi } from "@/services/me";
import { tokenReceived } from "@/store/slices/session";
import { staffOrder } from "@/test/orders";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { DecisionModel } from "../types";
import { useCancellationDecision } from "./use-cancellation-decision";

type ToastMock = Mock & { success: Mock; error: Mock };

const toast: ToastMock = vi.hoisted((): ToastMock =>
  Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
);

vi.mock("sonner", () => ({ toast }));

const PENDING_REQUEST: StaffCancellationRequest = {
  status: "PENDING",
  reason: "TAKING_TOO_LONG",
  requestedAt: "2026-10-17T22:31:00Z",
};

const WAITING: StaffOrder = staffOrder(1042, {
  status: "PREPARING",
  allowedTransitions: [],
  canCancel: false,
  cancellationReasons: [],
  cancellationRequest: PENDING_REQUEST,
});

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

async function renderDecision(
  order: StaffOrder = WAITING,
  actions: ScreenAction[] = ["DECIDE_CANCELLATION"],
): Promise<RenderHookResult<DecisionModel, unknown>> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(staffMe(actions))));
  await store.dispatch(meApi.endpoints.getMe.initiate());
  return renderHook(() => useCancellationDecision(order), { wrapper: withStore(store) });
}

function recordPosts(path: string, answer: JsonBodyType, status: number = 200): unknown[] {
  const bodies: unknown[] = [];
  server.use(
    http.post(apiUrl(path), async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(answer, { status });
    }),
  );
  return bodies;
}

async function decide(
  result: RenderHookResult<DecisionModel, unknown>["result"],
  decision: "approve" | "decline",
  note: string,
): Promise<void> {
  act((): void => result.current.ask(decision));
  act((): void => result.current.form.setValue("note", note));
  await act(async (): Promise<void> => {
    result.current.submit(SUBMIT_EVENT);
    await Promise.resolve();
  });
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useCancellationDecision", () => {
  it("lets staff decide a pending request when /me grants it", async () => {
    const { result }: RenderHookResult<DecisionModel, unknown> = await renderDecision();

    await waitFor((): void => expect(result.current.canDecide).toBe(true));
  });

  it("offers no decision without the grant, nor once the request was decided", async () => {
    const withoutGrant: RenderHookResult<DecisionModel, unknown> = await renderDecision(
      WAITING,
      [],
    );
    const decided: RenderHookResult<DecisionModel, unknown> = await renderDecision({
      ...WAITING,
      cancellationRequest: { ...PENDING_REQUEST, status: "DECLINED" },
    });

    expect(withoutGrant.result.current.canDecide).toBe(false);
    expect(decided.result.current.canDecide).toBe(false);
  });

  it("approves with the note for the customer, says so and closes the dialog", async () => {
    const bodies: unknown[] = recordPosts(
      `/orders/${WAITING.id}/cancellation-request/approve`,
      staffOrder(1042, { status: "CANCELLED", live: false }),
    );
    const { result }: RenderHookResult<DecisionModel, unknown> = await renderDecision();

    await decide(result, "approve", " Tudo certo ");

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith("Cancelamento aprovado. Pedido #1042 cancelado"),
    );
    expect(bodies).toEqual([{ note: "Tudo certo" }]);
    expect(result.current.dialog?.open).toBe(false);
  });

  it("declines without a note and says the order goes on", async () => {
    const bodies: unknown[] = recordPosts(
      `/orders/${WAITING.id}/cancellation-request/decline`,
      staffOrder(1042, { status: "PREPARING" }),
    );
    const { result }: RenderHookResult<DecisionModel, unknown> = await renderDecision();

    await decide(result, "decline", "");

    await waitFor((): void =>
      expect(toast.success).toHaveBeenCalledWith(
        "Cancelamento recusado. O pedido segue em preparo",
      ),
    );
    expect(bodies).toEqual([{}]);
  });

  it("closes the dialog and shows the API's detail when nothing is left to decide", async () => {
    recordPosts(
      `/orders/${WAITING.id}/cancellation-request/approve`,
      problem(
        422,
        "NO_PENDING_CANCELLATION_REQUEST",
        "Não há solicitação de cancelamento pendente para este pedido",
      ),
      422,
    );
    const { result }: RenderHookResult<DecisionModel, unknown> = await renderDecision();

    await decide(result, "approve", "");

    await waitFor((): void =>
      expect(toast.error).toHaveBeenCalledWith(
        "Não há solicitação de cancelamento pendente para este pedido",
      ),
    );
    expect(result.current.dialog?.open).toBe(false);
  });
});
