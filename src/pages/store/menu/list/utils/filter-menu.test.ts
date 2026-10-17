import { describe, expect, it } from "vitest";
import type { MenuCategory } from "@/@types/menu";
import { ALL_FILTER } from "@/constants/filters";
import { filterMenu } from "./filter-menu";

const LANCHES: MenuCategory = {
  id: "c-lanches",
  name: "Lanches",
  products: [
    { id: "p-smash", name: "Smash duplo", description: "Pão brioche", price: 34.9 },
    { id: "p-frango", name: "Frango crispy", description: null, price: 29.9 },
  ],
};

const PIZZAS: MenuCategory = {
  id: "c-pizzas",
  name: "Pizzas",
  products: [{ id: "p-calabresa", name: "Calabresa", description: null, price: 52.9 }],
};

const BEBIDAS: MenuCategory = {
  id: "c-bebidas",
  name: "Bebidas",
  products: [{ id: "p-limonada", name: "Limonada da casa", description: null, price: 12 }],
};

const MENU: MenuCategory[] = [LANCHES, PIZZAS, BEBIDAS];

describe("filterMenu", () => {
  it("shows every category when nothing is searched or chosen", () => {
    expect(filterMenu(MENU, { search: "", categoryId: ALL_FILTER })).toEqual(MENU);
  });

  it("shows only the chosen category", () => {
    expect(filterMenu(MENU, { search: "", categoryId: PIZZAS.id })).toEqual([PIZZAS]);
  });

  it("keeps the products whose name has the search, ignoring case, accents and spaces", () => {
    const sections: MenuCategory[] = filterMenu(MENU, {
      search: "  LIMÕNADA ",
      categoryId: ALL_FILTER,
    });

    expect(sections).toEqual([BEBIDAS]);
  });

  it("drops the categories left without products", () => {
    const sections: MenuCategory[] = filterMenu(MENU, { search: "a", categoryId: ALL_FILTER });

    expect(sections.map(({ name }: MenuCategory): string => name)).toEqual([
      "Lanches",
      "Pizzas",
      "Bebidas",
    ]);
    expect(filterMenu(MENU, { search: "smash", categoryId: ALL_FILTER })).toEqual([
      { ...LANCHES, products: [LANCHES.products[0]] },
    ]);
  });

  it("searches only inside the chosen category", () => {
    expect(filterMenu(MENU, { search: "calabresa", categoryId: LANCHES.id })).toEqual([]);
  });

  it("matches the product name, not its description", () => {
    expect(filterMenu(MENU, { search: "brioche", categoryId: ALL_FILTER })).toEqual([]);
  });
});
