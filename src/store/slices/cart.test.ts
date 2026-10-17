import { describe, expect, it } from "vitest";
import type { CartItem } from "@/@types/menu";
import {
  canAddToCart,
  cartCleared,
  cartReset,
  cartRestored,
  cartSlice,
  itemAdded,
  itemDecremented,
  itemIncremented,
  itemRemoved,
  selectCartCount,
  selectCartItems,
  type CartState,
} from "./cart";

const SMASH: string = "product-smash";

const LEMONADE: string = "product-lemonade";

const EMPTY: CartState = { items: [] };

const TWO_LINES: CartState = {
  items: [
    { productId: SMASH, quantity: 2 },
    { productId: LEMONADE, quantity: 1 },
  ],
};

function fullCart(): CartState {
  return {
    items: Array.from({ length: 50 }, (_item: unknown, index: number): CartItem => ({
      productId: `product-${index}`,
      quantity: 1,
    })),
  };
}

function reduce(
  state: CartState,
  ...actions: Parameters<typeof cartSlice.reducer>[1][]
): CartState {
  return actions.reduce(cartSlice.reducer, state);
}

describe("cart slice", () => {
  it("starts empty", () => {
    const state: CartState = cartSlice.reducer(undefined, { type: "init" });

    expect(state).toEqual(EMPTY);
  });

  it("adds a new product with one unit, after the ones already there", () => {
    const state: CartState = reduce(TWO_LINES, itemAdded("product-brownie"));

    expect(state.items).toEqual([
      ...TWO_LINES.items,
      { productId: "product-brownie", quantity: 1 },
    ]);
  });

  it("adds one more unit of a product already in the cart", () => {
    const state: CartState = reduce(TWO_LINES, itemAdded(SMASH));

    expect(state.items[0]).toEqual({ productId: SMASH, quantity: 3 });
  });

  it("never goes past 20 units of a product, adding or incrementing", () => {
    const state: CartState = reduce(
      { items: [{ productId: SMASH, quantity: 19 }] },
      itemAdded(SMASH),
      itemAdded(SMASH),
      itemIncremented(SMASH),
    );

    expect(state.items).toEqual([{ productId: SMASH, quantity: 20 }]);
  });

  it("refuses a 51st distinct product but still adds units of the ones it has", () => {
    const state: CartState = reduce(fullCart(), itemAdded("one-too-many"), itemAdded("product-0"));

    expect(state.items).toHaveLength(50);
    expect(state.items.map(({ productId }: CartItem): string => productId)).not.toContain(
      "one-too-many",
    );
    expect(state.items[0]).toEqual({ productId: "product-0", quantity: 2 });
  });

  it("increments only a product that is in the cart", () => {
    const state: CartState = reduce(TWO_LINES, itemIncremented(LEMONADE), itemIncremented("nope"));

    expect(state.items).toEqual([
      { productId: SMASH, quantity: 2 },
      { productId: LEMONADE, quantity: 2 },
    ]);
  });

  it("decrements a product and removes it when it reaches zero", () => {
    const state: CartState = reduce(TWO_LINES, itemDecremented(SMASH), itemDecremented(LEMONADE));

    expect(state.items).toEqual([{ productId: SMASH, quantity: 1 }]);
  });

  it("removes a product whatever its quantity", () => {
    const state: CartState = reduce(TWO_LINES, itemRemoved(SMASH));

    expect(state.items).toEqual([{ productId: LEMONADE, quantity: 1 }]);
  });

  it("empties the cart when cleared or reset", () => {
    expect(reduce(TWO_LINES, cartCleared())).toEqual(EMPTY);
    expect(reduce(TWO_LINES, cartReset())).toEqual(EMPTY);
  });

  it("replaces its items with the ones restored for the user", () => {
    const state: CartState = reduce(TWO_LINES, cartRestored([{ productId: SMASH, quantity: 5 }]));

    expect(state.items).toEqual([{ productId: SMASH, quantity: 5 }]);
  });

  it("selects the items and counts every unit", () => {
    const root: { cart: CartState } = { cart: TWO_LINES };

    expect(selectCartItems(root)).toEqual(TWO_LINES.items);
    expect(selectCartCount(root)).toBe(3);
  });
});

describe("canAddToCart", () => {
  it("accepts a new product while there is room for it", () => {
    expect(canAddToCart(TWO_LINES.items, "product-brownie")).toBe(true);
  });

  it("refuses a product already at 20 units", () => {
    expect(canAddToCart([{ productId: SMASH, quantity: 20 }], SMASH)).toBe(false);
  });

  it("refuses a new product when 50 distinct products are in the cart", () => {
    expect(canAddToCart(fullCart().items, "one-too-many")).toBe(false);
    expect(canAddToCart(fullCart().items, "product-3")).toBe(true);
  });
});
