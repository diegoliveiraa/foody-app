import { describe, expect, it } from "vitest";
import type { Product } from "@/@types/catalog";
import type { ProductFormInput } from "@/services/validation-schemas/product";
import { EMPTY_PRODUCT_FORM, toProductFormInput } from "./to-form-input";

const SMASH: Product = {
  id: "0199f2a0-0000-7000-8000-0000000000a1",
  name: "Smash duplo",
  description: "Dois blends de 90 g",
  price: 34.9,
  category: { id: "0199f2a0-0000-7000-8000-0000000000c1", name: "Lanches" },
  status: "ACTIVE",
  createdAt: "2026-03-04T15:00:00Z",
  disabledAt: null,
};

describe("toProductFormInput", () => {
  it("fills the form with the product, its price written the Brazilian way", () => {
    const input: ProductFormInput = toProductFormInput(SMASH);

    expect(input).toEqual({
      name: "Smash duplo",
      description: "Dois blends de 90 g",
      price: "34,90",
      categoryId: SMASH.category.id,
    });
  });

  it("leaves the description blank when the product has none", () => {
    const input: ProductFormInput = toProductFormInput({ ...SMASH, description: null });

    expect(input.description).toBe("");
  });

  it("starts a new product with every field blank", () => {
    expect(EMPTY_PRODUCT_FORM).toEqual({ name: "", description: "", price: "", categoryId: "" });
  });
});
