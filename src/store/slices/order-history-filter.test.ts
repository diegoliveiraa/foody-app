import type { Reducer } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/constants/pagination";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import {
  DEFAULT_HISTORY_SORT,
  HISTORY_COLUMNS,
  NO_DATE,
} from "@/pages/orders/order-list/history/constants";
import type { HistoryFilterState } from "@/pages/orders/order-list/history/filter/types";
import { settledSearchToApply } from "@/utils/settled-search";
import { sessionCleared, sessionExpired } from "./session";
import {
  filtersCleared,
  fromChanged,
  INITIAL_HISTORY_FILTER,
  isInvertedRange,
  orderHistoryFilterSlice,
  pageChanged,
  pageSizeChanged,
  searchApplied,
  searchChanged,
  sortChanged,
  statusChanged,
  toChanged,
} from "./order-history-filter";

const reduce: Reducer<HistoryFilterState> = orderHistoryFilterSlice.reducer;

const ON_PAGE_THREE: HistoryFilterState = { ...INITIAL_HISTORY_FILTER, page: 3 };

const FILTERED: HistoryFilterState = {
  search: "ana",
  appliedSearch: "ana",
  status: "DELIVERED",
  from: "2026-10-01",
  to: "2026-10-17",
  appliedFrom: "2026-10-01",
  appliedTo: "2026-10-17",
  page: 4,
  pageSize: 50,
  sort: { property: HISTORY_COLUMNS.TOTAL, direction: SORT_DIRECTIONS.ASC },
};

describe("order history filter slice", () => {
  it("starts on the first page of 10 orders, newest first, without search or filters", () => {
    expect(INITIAL_HISTORY_FILTER).toEqual({
      search: EMPTY_SEARCH,
      appliedSearch: EMPTY_SEARCH,
      status: ALL_FILTER,
      from: NO_DATE,
      to: NO_DATE,
      appliedFrom: NO_DATE,
      appliedTo: NO_DATE,
      page: FIRST_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      sort: DEFAULT_HISTORY_SORT,
    });
    expect(DEFAULT_HISTORY_SORT).toEqual({ property: "placedAt", direction: "desc" });
  });

  it("keeps the page and the applied search while a search is being typed", () => {
    const state: HistoryFilterState = reduce(ON_PAGE_THREE, searchChanged("10"));

    expect(state).toEqual({ ...ON_PAGE_THREE, search: "10" });
  });

  it("applies a settled search on the first page", () => {
    const typing: HistoryFilterState = { ...ON_PAGE_THREE, search: "1042" };

    const state: HistoryFilterState = reduce(typing, searchApplied("1042"));

    expect(state).toEqual({ ...typing, appliedSearch: "1042", page: FIRST_PAGE });
  });

  it("goes back to the first page when the status filter changes", () => {
    const state: HistoryFilterState = reduce(ON_PAGE_THREE, statusChanged("CANCELLED"));

    expect(state).toEqual({ ...INITIAL_HISTORY_FILTER, status: "CANCELLED" });
  });

  it("applies each date on the first page while the range stays in order", () => {
    const from: HistoryFilterState = reduce(ON_PAGE_THREE, fromChanged("2026-10-01"));
    const to: HistoryFilterState = reduce({ ...from, page: 2 }, toChanged("2026-10-17"));

    expect(from).toEqual({
      ...INITIAL_HISTORY_FILTER,
      from: "2026-10-01",
      appliedFrom: "2026-10-01",
    });
    expect(to).toEqual({
      ...INITIAL_HISTORY_FILTER,
      from: "2026-10-01",
      to: "2026-10-17",
      appliedFrom: "2026-10-01",
      appliedTo: "2026-10-17",
    });
  });

  it("applies a range that starts and ends on the same day", () => {
    const state: HistoryFilterState = reduce(
      { ...FILTERED, from: "2026-10-17", appliedFrom: "2026-10-17" },
      toChanged("2026-10-17"),
    );

    expect(state.appliedTo).toBe("2026-10-17");
    expect(isInvertedRange(state.from, state.to)).toBe(false);
  });

  it("keeps the last valid range and page while the end date is earlier than the start", () => {
    const state: HistoryFilterState = reduce(FILTERED, toChanged("2026-09-30"));

    expect(state).toEqual({ ...FILTERED, to: "2026-09-30" });
    expect(isInvertedRange(state.from, state.to)).toBe(true);
  });

  it("keeps the last valid range while the start date is moved past the end", () => {
    const state: HistoryFilterState = reduce(FILTERED, fromChanged("2026-10-20"));

    expect(state).toEqual({ ...FILTERED, from: "2026-10-20" });
    expect(isInvertedRange(state.from, state.to)).toBe(true);
  });

  it("applies the range again, on the first page, once it is put back in order", () => {
    const inverted: HistoryFilterState = reduce(FILTERED, toChanged("2026-09-30"));

    const state: HistoryFilterState = reduce(inverted, fromChanged("2026-09-01"));

    expect(state).toEqual({
      ...FILTERED,
      from: "2026-09-01",
      to: "2026-09-30",
      appliedFrom: "2026-09-01",
      appliedTo: "2026-09-30",
      page: FIRST_PAGE,
    });
  });

  it("never treats a range with a missing date as inverted", () => {
    expect([
      isInvertedRange(NO_DATE, "2026-10-01"),
      isInvertedRange("2026-10-17", NO_DATE),
      isInvertedRange(NO_DATE, NO_DATE),
    ]).toEqual([false, false, false]);
  });

  it("goes back to the first page when the page size changes", () => {
    const state: HistoryFilterState = reduce(ON_PAGE_THREE, pageSizeChanged(25));

    expect(state).toEqual({ ...INITIAL_HISTORY_FILTER, pageSize: 25 });
  });

  it("goes back to the first page when the sort changes, keeping the search and filters", () => {
    const byNumber: HistoryFilterState["sort"] = {
      property: HISTORY_COLUMNS.NUMBER,
      direction: SORT_DIRECTIONS.DESC,
    };

    const state: HistoryFilterState = reduce(FILTERED, sortChanged(byNumber));

    expect(state).toEqual({ ...FILTERED, sort: byNumber, page: FIRST_PAGE });
  });

  it("moves to another page keeping the search, filters and sort", () => {
    const state: HistoryFilterState = reduce(FILTERED, pageChanged(5));

    expect(state).toEqual({ ...FILTERED, page: 5 });
  });

  it("clears the search, status and dates, back on the first page, keeping page size and sort", () => {
    const state: HistoryFilterState = reduce(FILTERED, filtersCleared());

    expect(state).toEqual({
      ...INITIAL_HISTORY_FILTER,
      pageSize: FILTERED.pageSize,
      sort: FILTERED.sort,
    });
  });

  it("applies nothing right after the filters were cleared, while the old search settles", () => {
    const cleared: HistoryFilterState = reduce(FILTERED, filtersCleared());

    const search: string | null = settledSearchToApply(cleared, "ana");

    expect(search).toBeNull();
  });

  it("forgets everything when the user logs out", () => {
    const state: HistoryFilterState = reduce(FILTERED, sessionCleared());

    expect(state).toEqual(INITIAL_HISTORY_FILTER);
  });

  it("forgets everything when the API ends the session", () => {
    const state: HistoryFilterState = reduce(FILTERED, sessionExpired());

    expect(state).toEqual(INITIAL_HISTORY_FILTER);
  });
});
