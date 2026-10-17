import type { TagDescription } from "@reduxjs/toolkit/query";
import { renderHook, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { CACHE_TAGS, LIST_ID, type CacheTag } from "@/services/cache-tags";
import { menuApi } from "@/services/menu";
import { tokenReceived } from "@/store/slices/session";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { useReload } from "./use-reload";

const MENU_TAGS: readonly TagDescription<CacheTag>[] = [CACHE_TAGS.MENU];

const ORDER_LIST_TAGS: readonly TagDescription<CacheTag>[] = [
  { type: CACHE_TAGS.ORDER, id: LIST_ID },
];

function countMenuReads(): () => number {
  let reads: number = 0;
  server.use(
    http.get(apiUrl("/menu"), () => {
      reads += 1;
      return HttpResponse.json({ categories: [] });
    }),
  );
  return (): number => reads;
}

async function storeWithMenu(): Promise<TestStore> {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  await testStore.store.dispatch(menuApi.endpoints.getMenu.initiate());
  return testStore;
}

describe("useReload", () => {
  it("asks the API again for every open query carrying the given tags", async () => {
    const menuReads: () => number = countMenuReads();
    const { store }: TestStore = await storeWithMenu();
    const { result }: RenderHookResult<() => void, unknown> = renderHook(
      () => useReload(MENU_TAGS),
      { wrapper: withStore(store) },
    );

    result.current();

    await vi.waitFor((): void => expect(menuReads()).toBe(2));
  });

  it("leaves queries with other tags alone", async () => {
    const menuReads: () => number = countMenuReads();
    const { store }: TestStore = await storeWithMenu();
    const { result }: RenderHookResult<() => void, unknown> = renderHook(
      () => useReload(ORDER_LIST_TAGS),
      { wrapper: withStore(store) },
    );

    result.current();
    await new Promise((resolve: (value: unknown) => void): void => {
      setTimeout(resolve, 50);
    });

    expect(menuReads()).toBe(1);
  });
});
