import { renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { CartItem, CartQuote, QuoteRequest } from "@/@types/menu";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { CartQuoteModel } from "../types";
import { useCartQuote } from "./use-cart-quote";

type QuoteHook = RenderHookResult<CartQuoteModel, { items: CartItem[] }>;

const SLOW_QUOTE_MS: number = 200;

const ONE_SMASH: CartItem[] = [{ productId: "p-smash", quantity: 1 }];

const TWO_SMASH: CartItem[] = [{ productId: "p-smash", quantity: 2 }];

const QUOTE: CartQuote = {
  items: [
    {
      productId: "p-smash",
      name: "Smash duplo",
      unitPrice: 34.9,
      quantity: 1,
      subtotal: 34.9,
      available: true,
    },
  ],
  total: 34.9,
};

function renderQuote(items: CartItem[]): QuoteHook {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return renderHook(
    ({ items: cart }: { items: CartItem[] }): CartQuoteModel => useCartQuote(cart),
    {
      wrapper: withStore(store),
      initialProps: { items },
    },
  );
}

describe("useCartQuote", () => {
  it("asks for no quote while the cart is empty", () => {
    const { result }: QuoteHook = renderQuote([]);

    expect(result.current).toEqual({
      quote: undefined,
      quoting: false,
      error: null,
      hasUnavailable: false,
    });
  });

  it("prices the cart's items with the API", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(apiUrl("/menu/quote"), async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(QUOTE);
      }),
    );

    const { result }: QuoteHook = renderQuote(ONE_SMASH);

    expect(result.current.quoting).toBe(true);
    await waitFor((): void => expect(result.current.quote).toEqual(QUOTE));
    expect(result.current.quoting).toBe(false);
    expect(bodies).toEqual([{ items: ONE_SMASH }]);
  });

  it("flags a quote with an item the API could not price", async () => {
    server.use(
      http.post(apiUrl("/menu/quote"), () =>
        HttpResponse.json({
          items: [{ productId: "p-smash", quantity: 1, available: false }],
          total: 0,
        }),
      ),
    );

    const { result }: QuoteHook = renderQuote(ONE_SMASH);

    await waitFor((): void => expect(result.current.hasUnavailable).toBe(true));
  });

  it("shows no total from the previous cart while the changed one is being priced", async () => {
    server.use(
      http.post(apiUrl("/menu/quote"), async ({ request }) => {
        const body: QuoteRequest = (await request.json()) as QuoteRequest;
        if (body.items[0]?.quantity === 2) {
          await delay(SLOW_QUOTE_MS);
          return HttpResponse.json({ ...QUOTE, total: 69.8 });
        }
        return HttpResponse.json(QUOTE);
      }),
    );
    const { result, rerender }: QuoteHook = renderQuote(ONE_SMASH);
    await waitFor((): void => expect(result.current.quote?.total).toBe(34.9));

    rerender({ items: TWO_SMASH });

    expect(result.current.quote).toBeUndefined();
    expect(result.current.quoting).toBe(true);
    await waitFor((): void => expect(result.current.quote?.total).toBe(69.8));
  });

  it("tells why the cart could not be priced", async () => {
    server.use(
      http.post(apiUrl("/menu/quote"), () =>
        HttpResponse.json(problem(400, "VALIDATION_FAILED", "Carrinho inválido"), { status: 400 }),
      ),
    );

    const { result }: QuoteHook = renderQuote(ONE_SMASH);

    await waitFor((): void => expect(result.current.error).toBe("Carrinho inválido"));
    expect(result.current.quoting).toBe(false);
  });
});
