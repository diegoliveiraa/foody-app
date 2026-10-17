import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { CartQuote } from "@/@types/menu";
import type { CustomerOrder, CustomerOrderPage, PlaceOrderRequest } from "@/@types/orders";
import { tokenReceived } from "@/store/slices/session";
import { customerOrder, customerPage, customerSummary, orderId, PAULISTA } from "@/test/orders";
import { problem } from "@/test/problems";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { CACHE_TAGS, LIST_ID } from "./cache-tags";
import { menuApi } from "./menu";
import { myOrdersApi } from "./my-orders";

interface InvalidatedQuery {
  endpointName: string;
}

const SMASH_ID: string = "0199f2a0-0000-7000-8000-0000000000a1";

const PLACE: PlaceOrderRequest = {
  items: [{ productId: SMASH_ID, quantity: 2 }],
  deliveryAddress: PAULISTA,
};

const QUOTE: CartQuote = {
  items: [
    {
      productId: SMASH_ID,
      name: "Smash duplo",
      unitPrice: 34.9,
      quantity: 2,
      subtotal: 69.8,
      available: true,
    },
  ],
  total: 69.8,
};

const PLACED: CustomerOrder = customerOrder(1042, { total: 69.8 });

function signedInStore(): TestStore {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  return testStore;
}

function recordListRequests(pages: readonly CustomerOrderPage[]): URL[] {
  const urls: URL[] = [];
  server.use(
    http.get(apiUrl("/my-orders"), ({ request }) => {
      const url: URL = new URL(request.url);
      urls.push(url);
      const page: number = Number(url.searchParams.get("page"));
      return HttpResponse.json(pages[page - 1] ?? pages[0]);
    }),
  );
  return urls;
}

function countQuotes(): () => number {
  let quotes: number = 0;
  server.use(
    http.post(apiUrl("/menu/quote"), () => {
      quotes += 1;
      return HttpResponse.json(QUOTE);
    }),
  );
  return (): number => quotes;
}

function invalidatedBy({ store }: TestStore, id: string): InvalidatedQuery[] {
  return myOrdersApi.util.selectInvalidatedBy(store.getState(), [{ type: CACHE_TAGS.ORDER, id }]);
}

describe("my orders service", () => {
  it("posts the cart's items and the delivery address to place an order", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(apiUrl("/my-orders"), async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(PLACED, { status: 201 });
      }),
    );
    const { store }: TestStore = signedInStore();

    const order: CustomerOrder = await store
      .dispatch(myOrdersApi.endpoints.placeOrder.initiate(PLACE))
      .unwrap();

    expect(order).toEqual(PLACED);
    expect(bodies).toEqual([PLACE]);
  });

  it("refreshes the customer's orders once a new one is placed", async () => {
    const urls: URL[] = recordListRequests([customerPage([])]);
    server.use(http.post(apiUrl("/my-orders"), () => HttpResponse.json(PLACED, { status: 201 })));
    const testStore: TestStore = signedInStore();
    await testStore.store.dispatch(myOrdersApi.endpoints.listMyOrders.initiate());

    await testStore.store.dispatch(myOrdersApi.endpoints.placeOrder.initiate(PLACE)).unwrap();

    await vi.waitFor((): void => expect(urls).toHaveLength(2));
  });

  it("prices the cart again when the API refuses a product that is no longer available", async () => {
    const quotes: () => number = countQuotes();
    server.use(
      http.post(apiUrl("/my-orders"), () =>
        HttpResponse.json(problem(422, "PRODUCT_UNAVAILABLE", "Smash duplo saiu do cardápio"), {
          status: 422,
        }),
      ),
    );
    const { store }: TestStore = signedInStore();
    await store.dispatch(menuApi.endpoints.quoteCart.initiate({ items: PLACE.items }));

    const placing: Promise<CustomerOrder> = store
      .dispatch(myOrdersApi.endpoints.placeOrder.initiate(PLACE))
      .unwrap();

    await expect(placing).rejects.toMatchObject({
      status: 422,
      data: { code: "PRODUCT_UNAVAILABLE" },
    });
    await vi.waitFor((): void => expect(quotes()).toBe(2));
  });

  it("keeps the quote when the API refuses the order for another reason", async () => {
    const quotes: () => number = countQuotes();
    server.use(
      http.post(apiUrl("/my-orders"), () =>
        HttpResponse.json(problem(400, "VALIDATION_FAILED"), { status: 400 }),
      ),
    );
    const { store }: TestStore = signedInStore();
    await store.dispatch(menuApi.endpoints.quoteCart.initiate({ items: PLACE.items }));

    await store.dispatch(myOrdersApi.endpoints.placeOrder.initiate(PLACE));
    await new Promise((resolve: (value: unknown) => void): void => {
      setTimeout(resolve, 50);
    });

    expect(quotes()).toBe(1);
  });

  it("asks for the first page of the customer's orders, newest first", async () => {
    const urls: URL[] = recordListRequests([customerPage([customerSummary(1042)])]);
    const { store }: TestStore = signedInStore();

    await store.dispatch(myOrdersApi.endpoints.listMyOrders.initiate());

    expect(urls).toHaveLength(1);
    expect(Object.fromEntries(urls[0]?.searchParams ?? [])).toEqual({
      page: "1",
      pageSize: "10",
      sort: "placedAt,desc",
    });
  });

  it("fetches the next page while the API says there is one, and stops after the last", async () => {
    const urls: URL[] = recordListRequests([
      customerPage([customerSummary(1042)], { hasNext: true, totalPages: 2 }),
      customerPage([customerSummary(1031)], { page: 2, hasNext: false, totalPages: 2 }),
    ]);
    const { store }: TestStore = signedInStore();
    await store.dispatch(myOrdersApi.endpoints.listMyOrders.initiate());
    const firstPageHasMore: boolean | undefined = myOrdersApi.endpoints.listMyOrders.select()(
      store.getState(),
    ).hasNextPage;

    await store.dispatch(
      myOrdersApi.endpoints.listMyOrders.initiate(undefined, { direction: "forward" }),
    );

    const { data, hasNextPage } = myOrdersApi.endpoints.listMyOrders.select()(store.getState());
    expect(firstPageHasMore).toBe(true);
    expect(urls.map((url: URL): string | null => url.searchParams.get("page"))).toEqual(["1", "2"]);
    expect(data?.pages.map((page: CustomerOrderPage): number => page.meta.page)).toEqual([1, 2]);
    expect(hasNextPage).toBe(false);
  });

  it("tags the customer's orders as a list and one by one", async () => {
    recordListRequests([customerPage([customerSummary(1042)])]);
    const testStore: TestStore = signedInStore();

    await testStore.store.dispatch(myOrdersApi.endpoints.listMyOrders.initiate());

    expect(invalidatedBy(testStore, orderId(1042))).toEqual([
      expect.objectContaining({ endpointName: "listMyOrders" }),
    ]);
    expect(invalidatedBy(testStore, LIST_ID)).toHaveLength(1);
  });

  it("reads one of the customer's orders by its id, tagged with it", async () => {
    const paths: string[] = [];
    server.use(
      http.get(apiUrl(`/my-orders/${PLACED.id}`), ({ request }) => {
        paths.push(new URL(request.url).pathname);
        return HttpResponse.json(PLACED);
      }),
    );
    const testStore: TestStore = signedInStore();

    const order: CustomerOrder = await testStore.store
      .dispatch(myOrdersApi.endpoints.getMyOrder.initiate(PLACED.id))
      .unwrap();

    expect(order).toEqual(PLACED);
    expect(paths).toEqual([`/my-orders/${PLACED.id}`]);
    expect(invalidatedBy(testStore, PLACED.id)).toEqual([
      expect.objectContaining({ endpointName: "getMyOrder" }),
    ]);
  });

  it("rejects with 404 for an order that is not the customer's", async () => {
    server.use(
      http.get(apiUrl(`/my-orders/${PLACED.id}`), () =>
        HttpResponse.json(problem(404, "ORDER_NOT_FOUND"), { status: 404 }),
      ),
    );
    const { store }: TestStore = signedInStore();

    const reading: Promise<CustomerOrder> = store
      .dispatch(myOrdersApi.endpoints.getMyOrder.initiate(PLACED.id))
      .unwrap();

    await expect(reading).rejects.toMatchObject({ status: 404 });
  });
});
