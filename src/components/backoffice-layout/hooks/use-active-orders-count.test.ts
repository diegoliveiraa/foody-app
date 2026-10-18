import { renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { ordersApi } from "@/services/orders";
import { tokenReceived } from "@/store/slices/session";
import { staffPage, staffSummary } from "@/test/orders";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { useActiveOrdersCount } from "./use-active-orders-count";

vi.mock("sonner", () => ({ toast: vi.fn() }));

const SETTLE_MS: number = 50;

function signedInStore(): TestStore {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  return testStore;
}

function answerBoard(totalItems: number): URL[] {
  const urls: URL[] = [];
  server.use(
    http.get(apiUrl("/orders"), ({ request }) => {
      urls.push(new URL(request.url));
      return HttpResponse.json(staffPage([staffSummary(1043)], { totalItems }));
    }),
  );
  return urls;
}

async function settle(): Promise<void> {
  await new Promise((resolve: (value: unknown) => void): void => {
    setTimeout(resolve, SETTLE_MS);
  });
}

describe("useActiveOrdersCount", () => {
  it("reads every active order the board reports, beyond the ones it lists", async () => {
    const urls: URL[] = answerBoard(134);
    const { store }: TestStore = signedInStore();
    await store.dispatch(ordersApi.endpoints.getOrderBoard.initiate());

    const { result }: RenderHookResult<number, unknown> = renderHook(useActiveOrdersCount, {
      wrapper: withStore(store),
    });

    expect(result.current).toBe(134);
    expect(urls).toHaveLength(1);
  });

  it("never asks for the board itself, leaving that to whoever keeps it live", async () => {
    const urls: URL[] = answerBoard(6);
    const { store }: TestStore = signedInStore();

    const { result }: RenderHookResult<number, unknown> = renderHook(useActiveOrdersCount, {
      wrapper: withStore(store),
    });
    await settle();

    expect(urls).toEqual([]);
    expect(result.current).toBe(0);
  });

  it("counts nothing when the board could not be loaded", async () => {
    server.use(
      http.get(apiUrl("/orders"), () =>
        HttpResponse.json(problem(500, "INTERNAL_ERROR", "Erro inesperado"), { status: 500 }),
      ),
    );
    const { store }: TestStore = signedInStore();
    await store.dispatch(ordersApi.endpoints.getOrderBoard.initiate());

    const { result }: RenderHookResult<number, unknown> = renderHook(useActiveOrdersCount, {
      wrapper: withStore(store),
    });

    await waitFor((): void => expect(result.current).toBe(0));
  });
});
