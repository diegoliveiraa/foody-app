import { describe, expect, it } from "vitest";
import type { CartItem, CartQuote, MenuCategory } from "@/@types/menu";
import type { BagLine } from "../types";
import { productNamesOf, toBagLines } from "./bag-lines";

const SMASH: CartItem = { productId: "p-smash", quantity: 2 };

const LEMONADE: CartItem = { productId: "p-limonada", quantity: 20 };

const MENU: MenuCategory[] = [
  {
    id: "c-lanches",
    name: "Lanches",
    products: [{ id: "p-smash", name: "Smash duplo", description: null, price: 34.9 }],
  },
  {
    id: "c-bebidas",
    name: "Bebidas",
    products: [{ id: "p-limonada", name: "Limonada da casa", description: null, price: 12 }],
  },
];

const QUOTE: CartQuote = {
  items: [
    {
      productId: "p-limonada",
      name: "Limonada",
      unitPrice: 12,
      quantity: 20,
      subtotal: 240,
      available: true,
    },
    { productId: "p-smash", name: null, quantity: 2, available: false },
  ],
  total: 240,
};

describe("toBagLines", () => {
  it("lists the cart in its order with the names from the menu while the quote is on its way", () => {
    const lines: BagLine[] = toBagLines([SMASH, LEMONADE], undefined, productNamesOf(MENU));

    expect(lines).toEqual([
      {
        productId: "p-smash",
        name: "Smash duplo",
        quantity: 2,
        unitPrice: null,
        subtotal: null,
        available: true,
        canIncrease: true,
      },
      {
        productId: "p-limonada",
        name: "Limonada da casa",
        quantity: 20,
        unitPrice: null,
        subtotal: null,
        available: true,
        canIncrease: false,
      },
    ]);
  });

  it("takes the unit price, subtotal and name the API quoted", () => {
    const [, lemonade] = toBagLines([SMASH, LEMONADE], QUOTE, productNamesOf(MENU));

    expect(lemonade).toMatchObject({ name: "Limonada", unitPrice: 12, subtotal: 240 });
  });

  it("marks an item the API could not price as unavailable, keeping a name for it", () => {
    const [smash] = toBagLines([SMASH], QUOTE, productNamesOf(MENU));

    expect(smash).toMatchObject({
      name: "Smash duplo",
      available: false,
      unitPrice: null,
      subtotal: null,
    });
  });

  it("names a product that is in no menu and no quote with a fallback", () => {
    const [unknown] = toBagLines(
      [{ productId: "p-gone", quantity: 1 }],
      { items: [{ productId: "p-gone", quantity: 1, available: false }], total: 0 },
      productNamesOf(MENU),
    );

    expect(unknown?.name).toBe("Produto indisponível");
  });
});
