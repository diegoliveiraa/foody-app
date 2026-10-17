import { describe, expect, it } from "vitest";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/constants/pagination";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { settledSearchToApply } from "@/utils/settled-search";
import { DEFAULT_PRODUCT_SORT, PRODUCT_COLUMNS } from "../constants";
import {
  categoryChanged,
  filtersCleared,
  INITIAL_PRODUCTS_FILTER,
  pageChanged,
  pageSizeChanged,
  productsFilterReducer,
  searchApplied,
  searchChanged,
  sortChanged,
  statusChanged,
} from "./index";
import type { ProductsFilterState } from "./types";

const LANCHES_ID: string = "0199f2a0-0000-7000-8000-0000000000c1";

const ON_PAGE_THREE: ProductsFilterState = { ...INITIAL_PRODUCTS_FILTER, page: 3 };

const FILTERED: ProductsFilterState = {
  search: "smash",
  appliedSearch: "smash",
  categoryId: LANCHES_ID,
  status: "DISABLED",
  page: 4,
  pageSize: 50,
  sort: { property: PRODUCT_COLUMNS.PRICE, direction: SORT_DIRECTIONS.DESC },
};

describe("products filter", () => {
  it("starts on the first page of 10 products by name, without search or filters", () => {
    expect(INITIAL_PRODUCTS_FILTER).toEqual({
      search: EMPTY_SEARCH,
      appliedSearch: EMPTY_SEARCH,
      categoryId: ALL_FILTER,
      status: ALL_FILTER,
      page: FIRST_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      sort: DEFAULT_PRODUCT_SORT,
    });
  });

  it("keeps the page and the applied search while a search is being typed", () => {
    const state: ProductsFilterState = productsFilterReducer(ON_PAGE_THREE, searchChanged("sm"));

    expect(state).toEqual({ ...ON_PAGE_THREE, search: "sm" });
  });

  it("applies a settled search on the first page", () => {
    const typing: ProductsFilterState = { ...ON_PAGE_THREE, search: "smash" };

    const state: ProductsFilterState = productsFilterReducer(typing, searchApplied("smash"));

    expect(state).toEqual({ ...typing, appliedSearch: "smash", page: FIRST_PAGE });
  });

  it("goes back to the first page when the category filter changes", () => {
    const state: ProductsFilterState = productsFilterReducer(
      ON_PAGE_THREE,
      categoryChanged(LANCHES_ID),
    );

    expect(state).toEqual({ ...INITIAL_PRODUCTS_FILTER, categoryId: LANCHES_ID });
  });

  it("goes back to the first page when the status filter changes", () => {
    const state: ProductsFilterState = productsFilterReducer(
      ON_PAGE_THREE,
      statusChanged("ACTIVE"),
    );

    expect(state).toEqual({ ...INITIAL_PRODUCTS_FILTER, status: "ACTIVE" });
  });

  it("goes back to the first page when the page size changes", () => {
    const state: ProductsFilterState = productsFilterReducer(ON_PAGE_THREE, pageSizeChanged(25));

    expect(state).toEqual({ ...INITIAL_PRODUCTS_FILTER, pageSize: 25 });
  });

  it("goes back to the first page when the sort changes, keeping the search and filters", () => {
    const newest: ProductsFilterState["sort"] = {
      property: PRODUCT_COLUMNS.CREATED_AT,
      direction: SORT_DIRECTIONS.DESC,
    };

    const state: ProductsFilterState = productsFilterReducer(FILTERED, sortChanged(newest));

    expect(state).toEqual({ ...FILTERED, sort: newest, page: FIRST_PAGE });
  });

  it("moves to another page keeping the search, filters and sort", () => {
    const state: ProductsFilterState = productsFilterReducer(FILTERED, pageChanged(5));

    expect(state).toEqual({ ...FILTERED, page: 5 });
  });

  it("clears the search and filters, back on the first page, keeping page size and sort", () => {
    const state: ProductsFilterState = productsFilterReducer(FILTERED, filtersCleared());

    expect(state).toEqual({
      ...INITIAL_PRODUCTS_FILTER,
      pageSize: FILTERED.pageSize,
      sort: FILTERED.sort,
    });
  });

  it("applies nothing right after the filters were cleared, while the old search settles", () => {
    const cleared: ProductsFilterState = productsFilterReducer(FILTERED, filtersCleared());

    const search: string | null = settledSearchToApply(cleared, "smash");

    expect(search).toBeNull();
  });
});
