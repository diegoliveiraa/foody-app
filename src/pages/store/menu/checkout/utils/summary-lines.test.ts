import { describe, expect, it } from "vitest";
import type { CartQuote } from "@/@types/menu";
import { CHECKOUT_MESSAGES } from "../constants/messages";
import type { SummaryLine } from "../types";
import { toSummaryLines } from "./summary-lines";

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
    {
      productId: "p-lemonade",
      name: "Limonada da casa",
      unitPrice: 12,
      quantity: 2,
      subtotal: 24,
      available: true,
    },
  ],
  total: 58.9,
};

describe("toSummaryLines", () => {
  it("writes each quoted item as quantity × name with the subtotal the API priced", () => {
    const lines: SummaryLine[] = toSummaryLines(QUOTE);

    expect(lines).toEqual([
      { productId: "p-smash", label: "1× Smash duplo", subtotal: 34.9, available: true },
      { productId: "p-lemonade", label: "2× Limonada da casa", subtotal: 24, available: true },
    ]);
  });

  it("marks an item the API could not price as unavailable, without an amount", () => {
    const lines: SummaryLine[] = toSummaryLines({
      items: [{ productId: "p-gone", name: null, quantity: 1, available: false }],
      total: 0,
    });

    expect(lines).toEqual([
      {
        productId: "p-gone",
        label: `1× ${CHECKOUT_MESSAGES.UNKNOWN_PRODUCT}`,
        subtotal: null,
        available: false,
      },
    ]);
  });

  it("has no lines before the cart is priced", () => {
    const lines: SummaryLine[] = toSummaryLines(undefined);

    expect(lines).toEqual([]);
  });
});
