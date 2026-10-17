import { describe, expect, it } from "vitest";
import type { OrderItemSummary } from "@/@types/orders";
import { countUnits, summarizeItems } from "./order-items";

const ITEMS: OrderItemSummary[] = [
  { productName: "Smash duplo", quantity: 1 },
  { productName: "Limonada da casa", quantity: 2 },
];

describe("summarizeItems", () => {
  it("lists each item with its quantity, in the order the API sent them", () => {
    const summary: string = summarizeItems(ITEMS);

    expect(summary).toBe("1× Smash duplo, 2× Limonada da casa");
  });

  it("returns nothing for an order without items", () => {
    const summary: string = summarizeItems([]);

    expect(summary).toBe("");
  });
});

describe("countUnits", () => {
  it("adds up the units of every item", () => {
    const units: number = countUnits(ITEMS);

    expect(units).toBe(3);
  });

  it("counts zero units without items", () => {
    const units: number = countUnits([]);

    expect(units).toBe(0);
  });
});
