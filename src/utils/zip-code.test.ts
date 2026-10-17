import { describe, expect, it } from "vitest";
import { maskZipCode } from "./zip-code";

describe("maskZipCode", () => {
  it("adds the hyphen after the fifth digit", () => {
    const masked: string = maskZipCode("01310100");

    expect(masked).toBe("01310-100");
  });

  it("keeps a CEP that already has its hyphen", () => {
    const masked: string = maskZipCode("01310-100");

    expect(masked).toBe("01310-100");
  });

  it("leaves the first five digits alone while they are typed", () => {
    const masked: string = maskZipCode("0131");

    expect(masked).toBe("0131");
  });

  it("drops anything that is not a digit and stops at eight digits", () => {
    const masked: string = maskZipCode("01.310 1009a9");

    expect(masked).toBe("01310-100");
  });

  it("returns nothing for text without digits", () => {
    const masked: string = maskZipCode("abc");

    expect(masked).toBe("");
  });
});
