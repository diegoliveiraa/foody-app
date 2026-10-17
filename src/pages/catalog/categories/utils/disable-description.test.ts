import { describe, expect, it } from "vitest";
import { disableDescriptionOf } from "./disable-description";

describe("disableDescriptionOf", () => {
  it("counts the products that leave the menu with the category", () => {
    expect(disableDescriptionOf(3)).toBe("Os 3 produtos desta categoria somem do cardápio.");
  });

  it("speaks of a single product in the singular", () => {
    expect(disableDescriptionOf(1)).toBe("1 produto desta categoria some do cardápio.");
  });

  it("drops the count when the category has no products", () => {
    expect(disableDescriptionOf(0)).toBe(
      "A categoria fica fora do cardápio até ser habilitada de novo.",
    );
  });
});
