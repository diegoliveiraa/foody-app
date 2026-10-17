import { describe, expect, it } from "vitest";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import {
  categoryChosen,
  INITIAL_MENU_FILTER,
  menuFilterReducer,
  searchChanged,
  searchCleared,
} from "./index";
import type { MenuFilterState } from "./types";

const PIZZAS_ID: string = "c-pizzas";

describe("menu filter", () => {
  it("starts showing every category, without a search", () => {
    expect(INITIAL_MENU_FILTER).toEqual({ search: EMPTY_SEARCH, categoryId: ALL_FILTER });
  });

  it("keeps the typed search and the chosen category apart", () => {
    const state: MenuFilterState = [searchChanged("smash"), categoryChosen(PIZZAS_ID)].reduce(
      menuFilterReducer,
      INITIAL_MENU_FILTER,
    );

    expect(state).toEqual({ search: "smash", categoryId: PIZZAS_ID });
  });

  it("clears only the search, keeping the chosen category", () => {
    const state: MenuFilterState = menuFilterReducer(
      { search: "smash", categoryId: PIZZAS_ID },
      searchCleared(),
    );

    expect(state).toEqual({ search: EMPTY_SEARCH, categoryId: PIZZAS_ID });
  });
});
