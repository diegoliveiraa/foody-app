import { describe, expect, it } from "vitest";
import { formatCount, formatMinutes, formatPercent, formatPercentChange } from "./format-number";

describe("formatCount", () => {
  it("groups thousands with a dot", () => {
    const shown: string = formatCount(1284);

    expect(shown).toBe("1.284");
  });

  it("shows zero as 0", () => {
    const shown: string = formatCount(0);

    expect(shown).toBe("0");
  });
});

describe("formatPercent", () => {
  it("shows a percentage from the API with a comma and one decimal", () => {
    const shown: string = formatPercent(4.2);

    expect(shown).toBe("4,2%");
  });

  it("keeps the decimal of a whole percentage", () => {
    const shown: string = formatPercent(4);

    expect(shown).toBe("4,0%");
  });
});

describe("formatPercentChange", () => {
  it("marks a rise with a plus sign", () => {
    const shown: string = formatPercentChange(12);

    expect(shown).toBe("+12%");
  });

  it("keeps the decimal the API sent and marks a fall with a minus sign", () => {
    const shown: string = formatPercentChange(-2.5);

    expect(shown).toBe("-2,5%");
  });

  it("shows no change without a sign", () => {
    const shown: string = formatPercentChange(0);

    expect(shown).toBe("0%");
  });
});

describe("formatMinutes", () => {
  it("shows a number of minutes", () => {
    const shown: string = formatMinutes(18);

    expect(shown).toBe("18 min");
  });

  it("groups thousands of minutes", () => {
    const shown: string = formatMinutes(1284);

    expect(shown).toBe("1.284 min");
  });
});
