import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MeResponse } from "@/@types/me";
import type { CartItem } from "@/@types/menu";
import { meApi } from "@/services/me";
import type { AppStore } from "@/store";
import { itemAdded, itemDecremented, itemRemoved, selectCartItems } from "@/store/slices/cart";
import { logoutRequested, sessionExpired, tokenReceived } from "@/store/slices/session";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";

vi.mock("sonner", () => ({ toast: vi.fn() }));

const ANA: MeResponse = {
  user: { id: "user-ana", name: "Ana", email: "ana@foody.dev" },
  modules: [],
};

const BRUNO: MeResponse = {
  user: { id: "user-bruno", name: "Bruno", email: "bruno@foody.dev" },
  modules: [],
};

const ANA_KEY: string = "foody:cart:user-ana";

const BRUNO_KEY: string = "foody:cart:user-bruno";

const SMASH: string = "product-smash";

const STORED: CartItem[] = [
  { productId: SMASH, quantity: 2 },
  { productId: "product-lemonade", quantity: 1 },
];

function storedUnder(key: string): unknown {
  const text: string | null = localStorage.getItem(key);
  return text === null ? null : JSON.parse(text);
}

async function signedInAs(me: MeResponse): Promise<TestStore> {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  server.use(
    http.get(apiUrl("/me"), () => HttpResponse.json(me)),
    http.post(apiUrl("/auth/logout"), () => new HttpResponse(null, { status: 204 })),
  );
  await testStore.store.dispatch(meApi.endpoints.getMe.initiate());
  return testStore;
}

function cartOf(store: AppStore): CartItem[] {
  return selectCartItems(store.getState());
}

afterEach((): void => {
  localStorage.clear();
});

describe("cart listeners", () => {
  it("save the cart under the signed-in user's key on every change", async () => {
    const { store }: TestStore = await signedInAs(ANA);

    store.dispatch(itemAdded(SMASH));
    store.dispatch(itemAdded(SMASH));
    store.dispatch(itemAdded("product-lemonade"));
    store.dispatch(itemDecremented("product-lemonade"));

    expect(storedUnder(ANA_KEY)).toEqual([{ productId: SMASH, quantity: 2 }]);
    expect(storedUnder(BRUNO_KEY)).toBeNull();
  });

  it("save an emptied cart too, so a removed product does not come back", async () => {
    const { store }: TestStore = await signedInAs(ANA);
    store.dispatch(itemAdded(SMASH));

    store.dispatch(itemRemoved(SMASH));

    expect(storedUnder(ANA_KEY)).toEqual([]);
  });

  it("bring back the user's own cart when /me arrives", async () => {
    localStorage.setItem(ANA_KEY, JSON.stringify(STORED));
    localStorage.setItem(BRUNO_KEY, JSON.stringify([{ productId: "other", quantity: 9 }]));

    const { store }: TestStore = await signedInAs(ANA);

    expect(cartOf(store)).toEqual(STORED);
  });

  it("start with an empty cart when the user has none stored", async () => {
    localStorage.setItem(BRUNO_KEY, JSON.stringify(STORED));

    const { store }: TestStore = await signedInAs(ANA);

    expect(cartOf(store)).toEqual([]);
  });

  it("start with an empty cart when the stored one is not JSON", async () => {
    localStorage.setItem(ANA_KEY, "{not json");

    const { store }: TestStore = await signedInAs(ANA);

    expect(cartOf(store)).toEqual([]);
  });

  it("start with an empty cart when the stored one breaks the cart's limits", async () => {
    localStorage.setItem(ANA_KEY, JSON.stringify([{ productId: SMASH, quantity: 21 }]));

    const { store }: TestStore = await signedInAs(ANA);

    expect(cartOf(store)).toEqual([]);
  });

  it("empty the cart in memory on logout but keep it stored for the user's next login", async () => {
    const { store, navigate }: TestStore = await signedInAs(ANA);
    store.dispatch(itemAdded(SMASH));

    store.dispatch(logoutRequested());

    await vi.waitFor((): void => expect(navigate).toHaveBeenCalledWith("/login"));
    expect(cartOf(store)).toEqual([]);
    expect(storedUnder(ANA_KEY)).toEqual([{ productId: SMASH, quantity: 1 }]);
  });

  it("empty the cart in memory when the session expires, keeping it stored", async () => {
    const { store, navigate }: TestStore = await signedInAs(ANA);
    store.dispatch(itemAdded(SMASH));

    store.dispatch(sessionExpired());

    await vi.waitFor((): void => expect(navigate).toHaveBeenCalledWith("/login"));
    expect(cartOf(store)).toEqual([]);
    expect(storedUnder(ANA_KEY)).toEqual([{ productId: SMASH, quantity: 1 }]);
  });

  it("show the next user only their own cart after a logout", async () => {
    localStorage.setItem(
      BRUNO_KEY,
      JSON.stringify([{ productId: "product-brownie", quantity: 1 }]),
    );
    const { store }: TestStore = await signedInAs(ANA);
    store.dispatch(itemAdded(SMASH));
    store.dispatch(logoutRequested());
    await vi.waitFor((): void => expect(Object.keys(store.getState().api.queries)).toEqual([]));
    server.use(http.get(apiUrl("/me"), () => HttpResponse.json(BRUNO)));
    store.dispatch(tokenReceived("bruno-token"));

    await store.dispatch(meApi.endpoints.getMe.initiate());

    expect(cartOf(store)).toEqual([{ productId: "product-brownie", quantity: 1 }]);
  });
});
