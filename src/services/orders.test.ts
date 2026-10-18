import { http, HttpResponse, type JsonBodyType } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { StaffOrder, StaffOrderPage } from "@/@types/orders";
import type { AppStore } from "@/store";
import { tokenReceived } from "@/store/slices/session";
import { countDashboardReads, openDashboard } from "@/test/dashboard-reads";
import { orderId, staffOrder, staffPage, staffSummary } from "@/test/orders";
import { problem } from "@/test/problems";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { CACHE_TAGS, LIST_ID } from "./cache-tags";
import { ordersApi } from "./orders";

interface InvalidatedQuery {
  endpointName: string;
}

const BOARD: StaffOrderPage = staffPage([
  staffSummary(1043),
  staffSummary(1042, { status: "PREPARING" }),
]);

function signedInStore(): TestStore {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  return testStore;
}

function recordListRequests(page: StaffOrderPage = BOARD): URL[] {
  const urls: URL[] = [];
  server.use(
    http.get(apiUrl("/orders"), ({ request }) => {
      urls.push(new URL(request.url));
      return HttpResponse.json(page);
    }),
  );
  return urls;
}

function invalidatedBy({ store }: TestStore, id: string): InvalidatedQuery[] {
  return ordersApi.util.selectInvalidatedBy(store.getState(), [{ type: CACHE_TAGS.ORDER, id }]);
}

describe("orders service", () => {
  it("asks for the whole board in one request: the three active statuses, 100 orders, oldest first", async () => {
    const urls: URL[] = recordListRequests();
    const { store }: TestStore = signedInStore();

    const board: StaffOrderPage = await store
      .dispatch(ordersApi.endpoints.getOrderBoard.initiate())
      .unwrap();

    expect(board).toEqual(BOARD);
    expect(urls).toHaveLength(1);
    expect([...(urls[0]?.searchParams.entries() ?? [])]).toEqual([
      ["status", "RECEIVED"],
      ["status", "PREPARING"],
      ["status", "OUT_FOR_DELIVERY"],
      ["pageSize", "100"],
      ["sort", "placedAt,asc"],
    ]);
  });

  it("tags the board as the order list and each order on it", async () => {
    recordListRequests();
    const testStore: TestStore = signedInStore();

    await testStore.store.dispatch(ordersApi.endpoints.getOrderBoard.initiate());

    expect(invalidatedBy(testStore, orderId(1042))).toEqual([
      expect.objectContaining({ endpointName: "getOrderBoard" }),
    ]);
    expect(invalidatedBy(testStore, LIST_ID)).toHaveLength(1);
  });

  it("asks for the history page with the search, statuses, dates, page size and sort it was given", async () => {
    const urls: URL[] = recordListRequests();
    const { store }: TestStore = signedInStore();

    await store.dispatch(
      ordersApi.endpoints.listOrders.initiate({
        search: "ana",
        status: ["DELIVERED"],
        from: "2026-10-01",
        to: "2026-10-17",
        page: 2,
        pageSize: 25,
        sort: ["total,desc"],
      }),
    );

    expect(Object.fromEntries(urls[0]?.searchParams ?? [])).toEqual({
      search: "ana",
      status: "DELIVERED",
      from: "2026-10-01",
      to: "2026-10-17",
      page: "2",
      pageSize: "25",
      sort: "total,desc",
    });
  });

  it("tags each history page as the order list and each order on it", async () => {
    recordListRequests();
    const testStore: TestStore = signedInStore();

    await testStore.store.dispatch(
      ordersApi.endpoints.listOrders.initiate({ page: 1, pageSize: 10, sort: ["placedAt,desc"] }),
    );

    expect(invalidatedBy(testStore, orderId(1043))).toEqual([
      expect.objectContaining({ endpointName: "listOrders" }),
    ]);
    expect(invalidatedBy(testStore, LIST_ID)).toHaveLength(1);
  });

  it("reads one order by its id for staff, tagged with it", async () => {
    const order: StaffOrder = staffOrder(1042);
    server.use(http.get(apiUrl(`/orders/${order.id}`), () => HttpResponse.json(order)));
    const testStore: TestStore = signedInStore();

    const read: StaffOrder = await testStore.store
      .dispatch(ordersApi.endpoints.getOrder.initiate(order.id))
      .unwrap();

    expect(read).toEqual(order);
    expect(invalidatedBy(testStore, order.id)).toEqual([
      expect.objectContaining({ endpointName: "getOrder" }),
    ]);
  });
});

type WriteMethod = "patch" | "post";

interface SentWrite {
  method: string;
  body: unknown;
}

interface StaffWriteCase {
  action: string;
  method: WriteMethod;
  path: string;
  body: unknown;
  answer: StaffOrder;
  send: (store: AppStore) => Promise<StaffOrder>;
}

const PREPARING: StaffOrder = staffOrder(1042, { status: "PREPARING" });

const PREPARING_ID: string = PREPARING.id;

const SETTLE_MS: number = 50;

const STAFF_WRITES: readonly StaffWriteCase[] = [
  {
    action: "advance",
    method: "patch",
    path: `/orders/${PREPARING_ID}/status`,
    body: { status: "OUT_FOR_DELIVERY" },
    answer: staffOrder(1042, { status: "OUT_FOR_DELIVERY" }),
    send: (store: AppStore): Promise<StaffOrder> =>
      store
        .dispatch(
          ordersApi.endpoints.updateOrderStatus.initiate({
            id: PREPARING_ID,
            status: "OUT_FOR_DELIVERY",
          }),
        )
        .unwrap(),
  },
  {
    action: "cancel",
    method: "post",
    path: `/orders/${PREPARING_ID}/cancel`,
    body: { reason: "OTHER", note: "Acabou o gás" },
    answer: staffOrder(1042, { status: "CANCELLED", live: false }),
    send: (store: AppStore): Promise<StaffOrder> =>
      store
        .dispatch(
          ordersApi.endpoints.cancelOrder.initiate({
            id: PREPARING_ID,
            reason: "OTHER",
            note: "Acabou o gás",
          }),
        )
        .unwrap(),
  },
  {
    action: "approval",
    method: "post",
    path: `/orders/${PREPARING_ID}/cancellation-request/approve`,
    body: { note: "Sem problema" },
    answer: staffOrder(1042, { status: "CANCELLED", live: false }),
    send: (store: AppStore): Promise<StaffOrder> =>
      store
        .dispatch(
          ordersApi.endpoints.approveCancellation.initiate({
            id: PREPARING_ID,
            note: "Sem problema",
          }),
        )
        .unwrap(),
  },
  {
    action: "decline",
    method: "post",
    path: `/orders/${PREPARING_ID}/cancellation-request/decline`,
    body: {},
    answer: staffOrder(1042, {
      status: "PREPARING",
      cancellationRequest: {
        status: "DECLINED",
        reason: "TAKING_TOO_LONG",
        requestedAt: "2026-10-17T22:31:00Z",
        decidedAt: "2026-10-17T22:33:00Z",
        decidedByName: "Carlos M.",
      },
    }),
    send: (store: AppStore): Promise<StaffOrder> =>
      store
        .dispatch(ordersApi.endpoints.declineCancellation.initiate({ id: PREPARING_ID }))
        .unwrap(),
  },
];

function answerWrite(
  write: StaffWriteCase,
  status: number = 200,
  answer: JsonBodyType = write.answer,
): SentWrite[] {
  const sent: SentWrite[] = [];
  server.use(
    http[write.method](apiUrl(write.path), async ({ request }) => {
      sent.push({ method: request.method, body: await request.json() });
      return HttpResponse.json(answer, { status });
    }),
  );
  return sent;
}

function countOrderReads(order: StaffOrder = PREPARING): () => number {
  let reads: number = 0;
  server.use(
    http.get(apiUrl(`/orders/${order.id}`), () => {
      reads += 1;
      return HttpResponse.json(order);
    }),
  );
  return (): number => reads;
}

async function settle(): Promise<void> {
  await new Promise((resolve: (value: unknown) => void): void => {
    setTimeout(resolve, SETTLE_MS);
  });
}

describe("orders service lifecycle", () => {
  it.each(STAFF_WRITES)("sends the $action with its method, address and body", async (write) => {
    const sent: SentWrite[] = answerWrite(write);
    const { store }: TestStore = signedInStore();

    const answered: StaffOrder = await write.send(store);

    expect(answered).toEqual(write.answer);
    expect(sent).toEqual([{ method: write.method.toUpperCase(), body: write.body }]);
  });

  it.each(STAFF_WRITES)(
    "writes the order answered to the $action into its detail without reading it again",
    async (write) => {
      answerWrite(write);
      const reads: () => number = countOrderReads();
      const { store }: TestStore = signedInStore();
      await store.dispatch(ordersApi.endpoints.getOrder.initiate(PREPARING_ID));

      await write.send(store);
      await settle();

      expect(ordersApi.endpoints.getOrder.select(PREPARING_ID)(store.getState()).data).toEqual(
        write.answer,
      );
      expect(reads()).toBe(1);
    },
  );

  it.each(STAFF_WRITES)(
    "refreshes the order lists and the dashboard after the $action",
    async (write) => {
      answerWrite(write);
      const boardReads: URL[] = recordListRequests();
      const dashboardReads: () => number = countDashboardReads();
      const { store }: TestStore = signedInStore();
      await store.dispatch(ordersApi.endpoints.getOrderBoard.initiate());
      await openDashboard(store);

      await write.send(store);

      await vi.waitFor((): void => expect(boardReads).toHaveLength(2));
      await vi.waitFor((): void => expect(dashboardReads()).toBe(2));
    },
  );

  it.each([
    [422, "NO_PENDING_CANCELLATION_REQUEST"],
    [409, "CONCURRENT_UPDATE"],
  ])("reads the order and the lists again when the API answers %i %s", async (status, code) => {
    const decline: StaffWriteCase = STAFF_WRITES[3] as StaffWriteCase;
    answerWrite(decline, status, problem(status, code));
    const reads: () => number = countOrderReads();
    const boardReads: URL[] = recordListRequests();
    const { store }: TestStore = signedInStore();
    await store.dispatch(ordersApi.endpoints.getOrder.initiate(PREPARING_ID));
    await store.dispatch(ordersApi.endpoints.getOrderBoard.initiate());

    await expect(decline.send(store)).rejects.toMatchObject({ status, data: { code } });

    await vi.waitFor((): void => expect(reads()).toBe(2));
    await vi.waitFor((): void => expect(boardReads).toHaveLength(2));
  });

  it("reads nothing again when the API rejects the note of a cancellation", async () => {
    const cancel: StaffWriteCase = STAFF_WRITES[1] as StaffWriteCase;
    answerWrite(cancel, 400, {
      ...problem(400, "VALIDATION_FAILED"),
      errors: [{ field: "note", message: "Conte o motivo do cancelamento na observação" }],
    });
    const reads: () => number = countOrderReads();
    const boardReads: URL[] = recordListRequests();
    const { store }: TestStore = signedInStore();
    await store.dispatch(ordersApi.endpoints.getOrder.initiate(PREPARING_ID));
    await store.dispatch(ordersApi.endpoints.getOrderBoard.initiate());

    await expect(cancel.send(store)).rejects.toMatchObject({ status: 400 });
    await settle();

    expect(reads()).toBe(1);
    expect(boardReads).toHaveLength(1);
  });
});
