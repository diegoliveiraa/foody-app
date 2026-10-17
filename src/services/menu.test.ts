import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { CartQuote, MenuResponse, QuoteRequest } from "@/@types/menu";
import { tokenReceived } from "@/store/slices/session";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { CACHE_TAGS } from "./cache-tags";
import { menuApi } from "./menu";

interface InvalidatedQuery {
  endpointName: string;
}

const SMASH_ID: string = "0199f2a0-0000-7000-8000-0000000000a1";

const LEMONADE_ID: string = "0199f2a0-0000-7000-8000-0000000000a2";

const MENU: MenuResponse = {
  categories: [
    {
      id: "0199f2a0-0000-7000-8000-0000000000c1",
      name: "Lanches",
      products: [{ id: SMASH_ID, name: "Smash duplo", description: null, price: 34.9 }],
    },
  ],
};

const ONE_SMASH: QuoteRequest = { items: [{ productId: SMASH_ID, quantity: 1 }] };

const QUOTE: CartQuote = {
  items: [
    {
      productId: SMASH_ID,
      name: "Smash duplo",
      unitPrice: 34.9,
      quantity: 1,
      subtotal: 34.9,
      available: true,
    },
  ],
  total: 34.9,
};

function signedInStore(): TestStore {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  return testStore;
}

function recordQuoteBodies(): unknown[] {
  const bodies: unknown[] = [];
  server.use(
    http.post(apiUrl("/menu/quote"), async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(QUOTE);
    }),
  );
  return bodies;
}

function menuQueriesInvalidatedBy({ store }: TestStore): InvalidatedQuery[] {
  return menuApi.util.selectInvalidatedBy(store.getState(), [CACHE_TAGS.MENU]);
}

describe("menu service", () => {
  it("reads the whole menu with one GET", async () => {
    const methods: string[] = [];
    server.use(
      http.get(apiUrl("/menu"), ({ request }) => {
        methods.push(request.method);
        return HttpResponse.json(MENU);
      }),
    );
    const { store }: TestStore = signedInStore();

    const menu: MenuResponse = await store.dispatch(menuApi.endpoints.getMenu.initiate()).unwrap();

    expect(menu).toEqual(MENU);
    expect(methods).toEqual(["GET"]);
  });

  it("tags the menu so a catalog write refreshes it", async () => {
    server.use(http.get(apiUrl("/menu"), () => HttpResponse.json(MENU)));
    const testStore: TestStore = signedInStore();

    await testStore.store.dispatch(menuApi.endpoints.getMenu.initiate());

    expect(menuQueriesInvalidatedBy(testStore)).toEqual([
      expect.objectContaining({ endpointName: "getMenu" }),
    ]);
  });

  it("posts the cart's product ids and quantities to be priced by the API", async () => {
    const bodies: unknown[] = recordQuoteBodies();
    const { store }: TestStore = signedInStore();

    const quote: CartQuote = await store
      .dispatch(menuApi.endpoints.quoteCart.initiate(ONE_SMASH))
      .unwrap();

    expect(quote).toEqual(QUOTE);
    expect(bodies).toEqual([ONE_SMASH]);
  });

  it("asks for a new quote whenever the cart changes, and reuses it while it does not", async () => {
    const bodies: unknown[] = recordQuoteBodies();
    const { store }: TestStore = signedInStore();
    const twoItems: QuoteRequest = {
      items: [...ONE_SMASH.items, { productId: LEMONADE_ID, quantity: 2 }],
    };

    await store.dispatch(menuApi.endpoints.quoteCart.initiate(ONE_SMASH));
    await store.dispatch(menuApi.endpoints.quoteCart.initiate({ ...ONE_SMASH }));
    await store.dispatch(menuApi.endpoints.quoteCart.initiate(twoItems));

    expect(bodies).toEqual([ONE_SMASH, twoItems]);
  });

  it("tags the quote with the menu, so a price change re-prices the cart", async () => {
    recordQuoteBodies();
    const testStore: TestStore = signedInStore();

    await testStore.store.dispatch(menuApi.endpoints.quoteCart.initiate(ONE_SMASH));

    expect(menuQueriesInvalidatedBy(testStore)).toEqual([
      expect.objectContaining({ endpointName: "quoteCart" }),
    ]);
  });
});
