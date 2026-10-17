import { describe, expect, it } from "vitest";
import type { ListProductsParams } from "@/@types/catalog";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { PRODUCT_COLUMNS } from "../constants";
import { INITIAL_PRODUCTS_FILTER } from "../filter";
import { toListProductsParams } from "./to-list-params";

const LANCHES_ID: string = "0199f2a0-0000-7000-8000-0000000000c1";

describe("toListProductsParams", () => {
  it("asks for the page, page size and sort, without search or filters by default", () => {
    const params: ListProductsParams = toListProductsParams(INITIAL_PRODUCTS_FILTER);

    expect(params).toStrictEqual({ page: 1, pageSize: 10, sort: ["name,asc"] });
  });

  it("sends the chosen category, status and sort", () => {
    const params: ListProductsParams = toListProductsParams({
      ...INITIAL_PRODUCTS_FILTER,
      categoryId: LANCHES_ID,
      status: "DISABLED",
      page: 2,
      pageSize: 25,
      sort: { property: PRODUCT_COLUMNS.PRICE, direction: SORT_DIRECTIONS.DESC },
    });

    expect(params).toStrictEqual({
      categoryId: LANCHES_ID,
      status: "DISABLED",
      page: 2,
      pageSize: 25,
      sort: ["price,desc"],
    });
  });

  it("sends the applied search, not the text still being typed", () => {
    const params: ListProductsParams = toListProductsParams({
      ...INITIAL_PRODUCTS_FILTER,
      search: "smash duplo",
      appliedSearch: "smash",
    });

    expect(params.search).toBe("smash");
  });

  it("sends no search while one is typed but not applied yet", () => {
    const params: ListProductsParams = toListProductsParams({
      ...INITIAL_PRODUCTS_FILTER,
      search: "smash",
    });

    expect(params).not.toHaveProperty("search");
  });
});
