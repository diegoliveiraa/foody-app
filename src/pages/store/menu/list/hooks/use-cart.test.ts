import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { MeResponse, ScreenAction } from "@/@types/me";
import type { CartItem, MenuProduct } from "@/@types/menu";
import { meApi } from "@/services/me";
import { cartRestored } from "@/store/slices/cart";
import { tokenReceived } from "@/store/slices/session";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { CartModel } from "../types";
import { useCart } from "./use-cart";

type ToastMock = Mock & { success: Mock; error: Mock };

type CartHook = RenderHookResult<CartModel, unknown>;

const toast: ToastMock = vi.hoisted((): ToastMock =>
  Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
);

vi.mock("sonner", () => ({ toast }));

const SMASH: MenuProduct = { id: "p-smash", name: "Smash duplo", description: null, price: 34.9 };

function customerMe(actions: ScreenAction[]): MeResponse {
  return {
    user: { id: "customer-1", name: "Ana", email: "ana@foody.dev" },
    modules: [
      {
        key: "store",
        label: "Loja",
        screens: [{ key: "store.menu", label: "Cardápio", actions }],
      },
    ],
  };
}

async function renderCart(
  stored: CartItem[] = [],
  actions: ScreenAction[] = ["PLACE_ORDER"],
): Promise<CartHook> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(customerMe(actions))));
  await store.dispatch(meApi.endpoints.getMe.initiate());
  store.dispatch(cartRestored(stored));
  return renderHook(useCart, { wrapper: withStore(store) });
}

function distinctItems(count: number): CartItem[] {
  return Array.from({ length: count }, (_item: unknown, index: number): CartItem => ({
    productId: `p-${index}`,
    quantity: 1,
  }));
}

beforeEach((): void => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("useCart", () => {
  it("lets the customer order only when /me grants it", async () => {
    const customer: CartHook = await renderCart();
    const viewer: CartHook = await renderCart([], []);

    await waitFor((): void => expect(customer.result.current.canOrder).toBe(true));
    expect(viewer.result.current.canOrder).toBe(false);
  });

  it("adds a product, counts the units and says it went into the bag", async () => {
    const { result }: CartHook = await renderCart([{ productId: "p-limonada", quantity: 2 }]);

    act((): void => result.current.add(SMASH));

    expect(result.current.items).toEqual([
      { productId: "p-limonada", quantity: 2 },
      { productId: SMASH.id, quantity: 1 },
    ]);
    expect(result.current.count).toBe(3);
    expect(toast.success).toHaveBeenCalledWith("Adicionado à sacola: Smash duplo", {
      id: "cart-added",
    });
  });

  it("explains the limit instead of adding a 21st unit", async () => {
    const { result }: CartHook = await renderCart([{ productId: SMASH.id, quantity: 20 }]);

    act((): void => result.current.add(SMASH));

    expect(result.current.count).toBe(20);
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("Você pode levar até 20 unidades de Smash duplo", {
      id: "cart-limit",
    });
  });

  it("explains the limit instead of adding a 51st distinct product", async () => {
    const { result }: CartHook = await renderCart(distinctItems(50));

    act((): void => result.current.add(SMASH));

    expect(result.current.items).toHaveLength(50);
    expect(toast).toHaveBeenCalledWith("A sacola aceita até 50 produtos diferentes", {
      id: "cart-limit",
    });
  });

  it("increases, decreases and removes products in the bag", async () => {
    const { result }: CartHook = await renderCart([
      { productId: SMASH.id, quantity: 1 },
      { productId: "p-limonada", quantity: 2 },
    ]);

    act((): void => result.current.increase("p-limonada"));
    act((): void => result.current.decrease(SMASH.id));
    act((): void => result.current.remove("p-nothing"));

    expect(result.current.items).toEqual([{ productId: "p-limonada", quantity: 3 }]);
  });
});
