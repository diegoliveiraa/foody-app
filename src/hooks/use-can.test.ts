import { renderHook, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { MeResponse } from "@/@types/me";
import { SCREEN_KEYS } from "@/constants/screens";
import { meApi } from "@/services/me";
import { tokenReceived } from "@/store/slices/session";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { useCan } from "./use-can";

const STAFF: MeResponse = {
  user: { id: "u-2", name: "Bruno", email: "bruno@foody.dev" },
  modules: [
    {
      key: "catalog",
      label: "Catálogo",
      screens: [{ key: "catalog.products", label: "Produtos", actions: ["CREATE", "UPDATE"] }],
    },
  ],
};

async function storeWithMe(me: MeResponse): Promise<TestStore> {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(me)));
  await testStore.store.dispatch(meApi.endpoints.getMe.initiate());
  return testStore;
}

describe("useCan", () => {
  it("allows an action that /me lists for the screen", async () => {
    const { store }: TestStore = await storeWithMe(STAFF);

    const { result }: RenderHookResult<boolean, unknown> = renderHook(
      () => useCan(SCREEN_KEYS.CATALOG_PRODUCTS, "CREATE"),
      { wrapper: withStore(store) },
    );

    expect(result.current).toBe(true);
  });

  it("denies an action that /me does not list for the screen", async () => {
    const { store }: TestStore = await storeWithMe(STAFF);

    const { result }: RenderHookResult<boolean, unknown> = renderHook(
      () => useCan(SCREEN_KEYS.CATALOG_PRODUCTS, "DELETE"),
      { wrapper: withStore(store) },
    );

    expect(result.current).toBe(false);
  });

  it("denies every action on a screen absent from /me", async () => {
    const { store }: TestStore = await storeWithMe(STAFF);

    const { result }: RenderHookResult<boolean, unknown> = renderHook(
      () => useCan(SCREEN_KEYS.ADMIN_USERS, "UPDATE"),
      { wrapper: withStore(store) },
    );

    expect(result.current).toBe(false);
  });
});
