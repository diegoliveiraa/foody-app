import { renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { MeResponse, MeUser } from "@/@types/me";
import { tokenReceived } from "@/store/slices/session";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { useCurrentUser } from "./use-current-user";

const CUSTOMER: MeResponse = {
  user: { id: "u-1", name: "Ana", email: "ana@foody.dev" },
  modules: [
    {
      key: "store",
      label: "Loja",
      screens: [{ key: "store.menu", label: "Cardápio", actions: ["PLACE_ORDER"] }],
    },
  ],
};

const SETTLE_MS: number = 50;

function countMeRequests(): () => number {
  let requests: number = 0;
  server.use(
    http.get(apiUrl("/me"), () => {
      requests += 1;
      return HttpResponse.json(CUSTOMER);
    }),
  );
  return (): number => requests;
}

describe("useCurrentUser", () => {
  it("returns the signed-in user from /me", async () => {
    const { store }: TestStore = createTestStore();
    store.dispatch(tokenReceived("valid-token"));
    countMeRequests();

    const { result }: RenderHookResult<MeUser | undefined, unknown> = renderHook(
      () => useCurrentUser(),
      { wrapper: withStore(store) },
    );

    await waitFor((): void => expect(result.current).toEqual(CUSTOMER.user));
  });

  it("never asks the API for /me while there is no session", async () => {
    const { store }: TestStore = createTestStore();
    const meRequests: () => number = countMeRequests();

    const { result }: RenderHookResult<MeUser | undefined, unknown> = renderHook(
      () => useCurrentUser(),
      { wrapper: withStore(store) },
    );
    await new Promise((resolve: (value: unknown) => void): void => {
      setTimeout(resolve, SETTLE_MS);
    });

    expect(meRequests()).toBe(0);
    expect(result.current).toBeUndefined();
  });
});
