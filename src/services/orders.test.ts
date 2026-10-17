import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { StaffOrder, StaffOrderPage } from "@/@types/orders";
import { tokenReceived } from "@/store/slices/session";
import { orderId, staffOrder, staffPage, staffSummary } from "@/test/orders";
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
