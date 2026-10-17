import { describe, expect, it } from "vitest";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/constants/pagination";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { settledSearchToApply } from "@/utils/settled-search";
import { DEFAULT_HISTORY_SORT, HISTORY_COLUMNS, NO_DATE } from "../constants";
import {
  filtersCleared,
  fromChanged,
  historyFilterReducer,
  INITIAL_HISTORY_FILTER,
  pageChanged,
  pageSizeChanged,
  searchApplied,
  searchChanged,
  sortChanged,
  statusChanged,
  toChanged,
} from "./index";
import type { HistoryFilterState } from "./types";

const ON_PAGE_THREE: HistoryFilterState = { ...INITIAL_HISTORY_FILTER, page: 3 };

const FILTERED: HistoryFilterState = {
  search: "ana",
  appliedSearch: "ana",
  status: "DELIVERED",
  from: "2026-10-01",
  to: "2026-10-17",
  page: 4,
  pageSize: 50,
  sort: { property: HISTORY_COLUMNS.TOTAL, direction: SORT_DIRECTIONS.ASC },
};

describe("order history filter", () => {
  it("starts on the first page of 10 orders, newest first, without search or filters", () => {
    expect(INITIAL_HISTORY_FILTER).toEqual({
      search: EMPTY_SEARCH,
      appliedSearch: EMPTY_SEARCH,
      status: ALL_FILTER,
      from: NO_DATE,
      to: NO_DATE,
      page: FIRST_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      sort: DEFAULT_HISTORY_SORT,
    });
    expect(DEFAULT_HISTORY_SORT).toEqual({ property: "placedAt", direction: "desc" });
  });

  it("keeps the page and the applied search while a search is being typed", () => {
    const state: HistoryFilterState = historyFilterReducer(ON_PAGE_THREE, searchChanged("10"));

    expect(state).toEqual({ ...ON_PAGE_THREE, search: "10" });
  });

  it("applies a settled search on the first page", () => {
    const typing: HistoryFilterState = { ...ON_PAGE_THREE, search: "1042" };

    const state: HistoryFilterState = historyFilterReducer(typing, searchApplied("1042"));

    expect(state).toEqual({ ...typing, appliedSearch: "1042", page: FIRST_PAGE });
  });

  it("goes back to the first page when the status filter changes", () => {
    const state: HistoryFilterState = historyFilterReducer(
      ON_PAGE_THREE,
      statusChanged("CANCELLED"),
    );

    expect(state).toEqual({ ...INITIAL_HISTORY_FILTER, status: "CANCELLED" });
  });

  it("goes back to the first page when either date changes", () => {
    const from: HistoryFilterState = historyFilterReducer(ON_PAGE_THREE, fromChanged("2026-10-01"));
    const to: HistoryFilterState = historyFilterReducer(
      { ...from, page: 2 },
      toChanged("2026-10-17"),
    );

    expect(from).toEqual({ ...INITIAL_HISTORY_FILTER, from: "2026-10-01" });
    expect(to).toEqual({ ...INITIAL_HISTORY_FILTER, from: "2026-10-01", to: "2026-10-17" });
  });

  it("goes back to the first page when the page size changes", () => {
    const state: HistoryFilterState = historyFilterReducer(ON_PAGE_THREE, pageSizeChanged(25));

    expect(state).toEqual({ ...INITIAL_HISTORY_FILTER, pageSize: 25 });
  });

  it("goes back to the first page when the sort changes, keeping the search and filters", () => {
    const byNumber: HistoryFilterState["sort"] = {
      property: HISTORY_COLUMNS.NUMBER,
      direction: SORT_DIRECTIONS.DESC,
    };

    const state: HistoryFilterState = historyFilterReducer(FILTERED, sortChanged(byNumber));

    expect(state).toEqual({ ...FILTERED, sort: byNumber, page: FIRST_PAGE });
  });

  it("moves to another page keeping the search, filters and sort", () => {
    const state: HistoryFilterState = historyFilterReducer(FILTERED, pageChanged(5));

    expect(state).toEqual({ ...FILTERED, page: 5 });
  });

  it("clears the search, status and dates, back on the first page, keeping page size and sort", () => {
    const state: HistoryFilterState = historyFilterReducer(FILTERED, filtersCleared());

    expect(state).toEqual({
      ...INITIAL_HISTORY_FILTER,
      pageSize: FILTERED.pageSize,
      sort: FILTERED.sort,
    });
  });

  it("applies nothing right after the filters were cleared, while the old search settles", () => {
    const cleared: HistoryFilterState = historyFilterReducer(FILTERED, filtersCleared());

    const search: string | null = settledSearchToApply(cleared, "ana");

    expect(search).toBeNull();
  });
});
