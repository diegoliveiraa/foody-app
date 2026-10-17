import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import type { JSX, ReactNode } from "react";
import { MemoryRouter, Route, Routes, useLocation, type Location } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { CartQuote } from "@/@types/menu";
import type { CartQuoteModel } from "../../types";
import type { BagModel, CartModel } from "../types";
import { useBag } from "./use-bag";

interface BagSetup {
  cart?: Partial<CartModel>;
  quote?: Partial<CartQuoteModel>;
}

interface Visited {
  pathnames: string[];
}

const QUOTE: CartQuote = {
  items: [
    {
      productId: "p-smash",
      name: "Smash duplo",
      unitPrice: 34.9,
      quantity: 2,
      subtotal: 69.8,
      available: true,
    },
  ],
  total: 69.8,
};

const CART: CartModel = {
  items: [{ productId: "p-smash", quantity: 2 }],
  count: 2,
  canOrder: true,
  add: vi.fn(),
  increase: vi.fn(),
  decrease: vi.fn(),
  remove: vi.fn(),
};

const QUOTED: CartQuoteModel = { quote: QUOTE, quoting: false, error: null, hasUnavailable: false };

const NAMES: ReadonlyMap<string, string> = new Map<string, string>([["p-smash", "Smash duplo"]]);

function LocationProbe({ visited }: { visited: Visited }): null {
  const location: Location = useLocation();
  visited.pathnames.push(location.pathname);
  return null;
}

function renderBag(
  { cart = {}, quote = {} }: BagSetup,
  visited: Visited = { pathnames: [] },
): RenderHookResult<BagModel, unknown> {
  function RouterWrapper({ children }: { children: ReactNode }): JSX.Element {
    return (
      <MemoryRouter initialEntries={["/menu"]}>
        <Routes>
          <Route path="/menu">
            <Route index element={children} />
            <Route path="checkout" element={<LocationProbe visited={visited} />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }
  return renderHook((): BagModel => useBag({ ...CART, ...cart }, { ...QUOTED, ...quote }, NAMES), {
    wrapper: RouterWrapper,
  });
}

describe("useBag", () => {
  it("lists the cart with the prices of the latest quote", () => {
    const { result }: RenderHookResult<BagModel, unknown> = renderBag({});

    expect(result.current.lines).toEqual([
      {
        productId: "p-smash",
        name: "Smash duplo",
        quantity: 2,
        unitPrice: 34.9,
        subtotal: 69.8,
        available: true,
        canIncrease: true,
      },
    ]);
    expect(result.current.canContinue).toBe(true);
  });

  it("does not let the customer continue while the quote is on its way", () => {
    const { result }: RenderHookResult<BagModel, unknown> = renderBag({
      quote: { quote: undefined, quoting: true },
    });

    expect(result.current.canContinue).toBe(false);
  });

  it("does not let the customer continue with an unavailable item", () => {
    const { result }: RenderHookResult<BagModel, unknown> = renderBag({
      quote: { hasUnavailable: true },
    });

    expect(result.current.canContinue).toBe(false);
  });

  it("does not let the customer continue with an empty bag or without a quote", () => {
    const empty: RenderHookResult<BagModel, unknown> = renderBag({
      cart: { items: [], count: 0 },
    });
    const unpriced: RenderHookResult<BagModel, unknown> = renderBag({
      quote: { quote: undefined, error: "Carrinho inválido" },
    });

    expect(empty.result.current.canContinue).toBe(false);
    expect(unpriced.result.current.canContinue).toBe(false);
  });

  it("opens and closes the bag", () => {
    const { result }: RenderHookResult<BagModel, unknown> = renderBag({});

    act((): void => result.current.show());
    const opened: boolean = result.current.open;
    act((): void => result.current.hide());

    expect(opened).toBe(true);
    expect(result.current.open).toBe(false);
  });

  it("closes the bag and goes to the checkout when the customer continues", async () => {
    const visited: Visited = { pathnames: [] };
    const { result }: RenderHookResult<BagModel, unknown> = renderBag({}, visited);
    act((): void => result.current.show());

    await act(async (): Promise<void> => {
      result.current.proceed();
      await Promise.resolve();
    });

    expect(visited.pathnames).toContain("/menu/checkout");
  });

  it("stays on the menu when continuing is not allowed", async () => {
    const visited: Visited = { pathnames: [] };
    const { result }: RenderHookResult<BagModel, unknown> = renderBag(
      { quote: { hasUnavailable: true } },
      visited,
    );

    await act(async (): Promise<void> => {
      result.current.proceed();
      await Promise.resolve();
    });

    expect(visited.pathnames).toEqual([]);
  });
});
