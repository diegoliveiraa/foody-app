import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StaffOrderPage } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";
import { ordersApi } from "@/services/orders";
import type { AppStore } from "@/store";
import { tokenReceived } from "@/store/slices/session";
import { staffPage, staffSummary } from "@/test/orders";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";

vi.mock("sonner", () => ({ toast: vi.fn() }));

const FIRST_BOARD: StaffOrderPage = staffPage([
  staffSummary(1043),
  staffSummary(1042, { status: "PREPARING" }),
]);

function answerBoardWith(...boards: StaffOrderPage[]): void {
  const queue: StaffOrderPage[] = [...boards];
  server.use(
    http.get(apiUrl("/orders"), () =>
      HttpResponse.json(queue.length > 1 ? queue.shift() : queue[0]),
    ),
  );
}

function signedInStore(): AppStore {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return store;
}

async function openBoard(store: AppStore): Promise<void> {
  await store.dispatch(ordersApi.endpoints.getOrderBoard.initiate());
}

async function poll(store: AppStore): Promise<void> {
  await store.dispatch(
    ordersApi.endpoints.getOrderBoard.initiate(undefined, { forceRefetch: true }),
  );
}

afterEach((): void => {
  vi.clearAllMocks();
});

describe("new order listener", () => {
  it("stays quiet on the board's first load", async () => {
    answerBoardWith(FIRST_BOARD);

    await openBoard(signedInStore());

    expect(toast).not.toHaveBeenCalled();
  });

  it("announces once each received order that was not on the board before", async () => {
    answerBoardWith(
      FIRST_BOARD,
      staffPage([staffSummary(1045), ...FIRST_BOARD.data, staffSummary(1044)]),
    );
    const store: AppStore = signedInStore();
    await openBoard(store);

    await poll(store);
    await poll(store);

    expect(vi.mocked(toast).mock.calls).toEqual([
      [MESSAGES.ORDERS.NEW_ORDER(1045)],
      [MESSAGES.ORDERS.NEW_ORDER(1044)],
    ]);
  });

  it("stays quiet for orders that only changed status", async () => {
    answerBoardWith(
      FIRST_BOARD,
      staffPage([
        staffSummary(1043, { status: "PREPARING" }),
        staffSummary(1042, { status: "OUT_FOR_DELIVERY" }),
      ]),
    );
    const store: AppStore = signedInStore();
    await openBoard(store);

    await poll(store);

    expect(toast).not.toHaveBeenCalled();
  });

  it("stays quiet for a new order that is no longer waiting to be received", async () => {
    answerBoardWith(
      FIRST_BOARD,
      staffPage([...FIRST_BOARD.data, staffSummary(1046, { status: "PREPARING" })]),
    );
    const store: AppStore = signedInStore();
    await openBoard(store);

    await poll(store);

    expect(toast).not.toHaveBeenCalled();
  });

  it("ignores the order history, which is not the board", async () => {
    answerBoardWith(FIRST_BOARD, staffPage([staffSummary(1047)]));
    const store: AppStore = signedInStore();
    await openBoard(store);

    await store.dispatch(
      ordersApi.endpoints.listOrders.initiate({ page: 1, pageSize: 10, sort: ["placedAt,desc"] }),
    );

    expect(toast).not.toHaveBeenCalled();
  });
});
