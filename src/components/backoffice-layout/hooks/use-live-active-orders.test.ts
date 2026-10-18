import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MeModule, MeResponse } from "@/@types/me";
import { LIVE_ORDER_POLLING_MS } from "@/constants/orders";
import { meApi } from "@/services/me";
import { tokenReceived } from "@/store/slices/session";
import { staffPage } from "@/test/orders";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { useLiveActiveOrders } from "./use-live-active-orders";

vi.mock("sonner", () => ({ toast: vi.fn() }));

const SETTLE_MS: number = 50;

const CATALOG: MeModule = {
  key: "catalog",
  label: "Catálogo",
  screens: [{ key: "catalog.products", label: "Produtos", actions: [] }],
};

const ORDERS: MeModule = {
  key: "orders",
  label: "Pedidos",
  screens: [{ key: "orders.order-list", label: "Pedidos", actions: ["UPDATE_STATUS"] }],
};

function meWith(modules: MeModule[]): MeResponse {
  return { user: { id: "u-2", name: "Bruno", email: "bruno@foody.dev" }, modules };
}

async function storeWithMe(me: MeResponse): Promise<TestStore> {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(me)));
  await testStore.store.dispatch(meApi.endpoints.getMe.initiate());
  return testStore;
}

function countBoardReads(): () => number {
  let reads: number = 0;
  server.use(
    http.get(apiUrl("/orders"), () => {
      reads += 1;
      return HttpResponse.json(staffPage([]));
    }),
  );
  return (): number => reads;
}

afterEach((): void => {
  vi.useRealTimers();
});

describe("useLiveActiveOrders", () => {
  it("keeps the board asked every 30 seconds for staff whose /me has the orders screen", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const reads: () => number = countBoardReads();
    const { store }: TestStore = await storeWithMe(meWith([CATALOG, ORDERS]));

    renderHook(useLiveActiveOrders, { wrapper: withStore(store) });

    await vi.waitFor((): void => expect(reads()).toBe(1));
    await vi.advanceTimersByTimeAsync(LIVE_ORDER_POLLING_MS);
    await vi.waitFor((): void => expect(reads()).toBe(2));
  });

  it("asks for no orders when /me has no orders screen", async () => {
    const reads: () => number = countBoardReads();
    const { store }: TestStore = await storeWithMe(meWith([CATALOG]));

    renderHook(useLiveActiveOrders, { wrapper: withStore(store) });
    await new Promise((resolve: (value: unknown) => void): void => {
      setTimeout(resolve, SETTLE_MS);
    });

    expect(reads()).toBe(0);
  });
});
