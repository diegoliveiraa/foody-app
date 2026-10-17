import { describe, expect, it } from "vitest";
import type { Category } from "@/@types/catalog";
import type { CategoryFormInput } from "@/services/validation-schemas/category";
import { newCategoryFormInput, toCategoryFormInput } from "./to-form-input";

function category(id: string, displayOrder: number): Category {
  return { id, name: `Categoria ${id}`, displayOrder, status: "ACTIVE", productCount: 0 };
}

describe("toCategoryFormInput", () => {
  it("fills the form with the category's name and display order", () => {
    const input: CategoryFormInput = toCategoryFormInput({ ...category("c1", 7), name: "Pizzas" });

    expect(input).toEqual({ name: "Pizzas", displayOrder: "7" });
  });
});

describe("newCategoryFormInput", () => {
  it("suggests the display order right after the last category", () => {
    const input: CategoryFormInput = newCategoryFormInput([
      category("c1", 1),
      category("c2", 9),
      category("c3", 4),
    ]);

    expect(input).toEqual({ name: "", displayOrder: "10" });
  });

  it("suggests zero for the first category", () => {
    expect(newCategoryFormInput([]).displayOrder).toBe("0");
  });

  it("never suggests more than the highest order the API accepts", () => {
    expect(newCategoryFormInput([category("c1", 999)]).displayOrder).toBe("999");
  });
});
