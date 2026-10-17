import { describe, expect, it } from "vitest";
import type { ListOrdersParams } from "@/@types/orders";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { HISTORY_COLUMNS } from "../constants";
import { INITIAL_HISTORY_FILTER } from "../filter";
import { toListOrdersParams } from "./to-list-params";

describe("toListOrdersParams", () => {
  it("asks for the page, page size and newest first, without search or filters by default", () => {
    const params: ListOrdersParams = toListOrdersParams(INITIAL_HISTORY_FILTER);

    expect(params).toStrictEqual({ page: 1, pageSize: 10, sort: ["placedAt,desc"] });
  });

  it("sends the chosen status, dates and sort", () => {
    const params: ListOrdersParams = toListOrdersParams({
      ...INITIAL_HISTORY_FILTER,
      status: "CANCELLED",
      from: "2026-10-01",
      to: "2026-10-17",
      page: 2,
      pageSize: 25,
      sort: { property: HISTORY_COLUMNS.TOTAL, direction: SORT_DIRECTIONS.ASC },
    });

    expect(params).toStrictEqual({
      status: ["CANCELLED"],
      from: "2026-10-01",
      to: "2026-10-17",
      page: 2,
      pageSize: 25,
      sort: ["total,asc"],
    });
  });

  it("sends the applied search, not the text still being typed", () => {
    const params: ListOrdersParams = toListOrdersParams({
      ...INITIAL_HISTORY_FILTER,
      search: "ana souza",
      appliedSearch: "ana",
    });

    expect(params.search).toBe("ana");
  });

  it("sends one date without the other", () => {
    const params: ListOrdersParams = toListOrdersParams({
      ...INITIAL_HISTORY_FILTER,
      to: "2026-10-17",
    });

    expect(params).not.toHaveProperty("from");
    expect(params.to).toBe("2026-10-17");
  });
});
