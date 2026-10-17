import { describe, expect, it } from "vitest";
import type { CartItem } from "@/@types/menu";
import { storedCartSchema } from "./stored-cart";

const SMASH: CartItem = { productId: "0199f2a0-0000-7000-8000-0000000000a1", quantity: 2 };

function distinctItems(count: number): CartItem[] {
  return Array.from({ length: count }, (_item: unknown, index: number): CartItem => ({
    productId: `product-${index}`,
    quantity: 1,
  }));
}

describe("stored cart schema", () => {
  it("accepts product ids with quantities from 1 to 20", () => {
    const items: unknown = [SMASH, { productId: "product-2", quantity: 20 }];

    expect(storedCartSchema.safeParse(items).success).toBe(true);
  });

  it("accepts an empty cart", () => {
    expect(storedCartSchema.safeParse([]).success).toBe(true);
  });

  it("rejects a quantity of zero, over 20 or not whole", () => {
    expect(storedCartSchema.safeParse([{ ...SMASH, quantity: 0 }]).success).toBe(false);
    expect(storedCartSchema.safeParse([{ ...SMASH, quantity: 21 }]).success).toBe(false);
    expect(storedCartSchema.safeParse([{ ...SMASH, quantity: 1.5 }]).success).toBe(false);
  });

  it("rejects more than 50 distinct products", () => {
    expect(storedCartSchema.safeParse(distinctItems(50)).success).toBe(true);
    expect(storedCartSchema.safeParse(distinctItems(51)).success).toBe(false);
  });

  it("rejects the same product twice", () => {
    expect(storedCartSchema.safeParse([SMASH, SMASH]).success).toBe(false);
  });

  it("rejects anything that is not a list of items", () => {
    expect(storedCartSchema.safeParse({ items: [SMASH] }).success).toBe(false);
    expect(storedCartSchema.safeParse([{ productId: "", quantity: 1 }]).success).toBe(false);
    expect(storedCartSchema.safeParse([{ id: SMASH.productId, qty: 1 }]).success).toBe(false);
  });
});
