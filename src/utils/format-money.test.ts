import { describe, expect, it } from "vitest";
import { formatDecimalInput, formatMoney } from "./format-money";

const NBSP: string = " ";

describe("formatMoney", () => {
  it("shows an amount from the API in reais, with a comma and two decimals", () => {
    const label: string = formatMoney(34.9);

    expect(label).toBe(`R$${NBSP}34,90`);
  });

  it("groups thousands with a dot", () => {
    const label: string = formatMoney(9999.99);

    expect(label).toBe(`R$${NBSP}9.999,99`);
  });

  it("shows zero as R$ 0,00", () => {
    const label: string = formatMoney(0);

    expect(label).toBe(`R$${NBSP}0,00`);
  });
});

describe("formatDecimalInput", () => {
  it("writes a price the way it is typed in Brazil, without the currency or grouping", () => {
    const text: string = formatDecimalInput(1234.5);

    expect(text).toBe("1234,50");
  });

  it("keeps whole amounts with two decimals", () => {
    const text: string = formatDecimalInput(12);

    expect(text).toBe("12,00");
  });
});
