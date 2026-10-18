import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SEARCH_DEBOUNCE_MS } from "@/constants/filters";
import { FIRST_PAGE } from "@/constants/pagination";
import type { HistoryFilterState } from "@/pages/orders/order-list/history/filter/types";
import type { AppStore } from "@/store";
import {
  filtersCleared,
  pageChanged,
  searchChanged,
  selectOrderHistoryFilter,
} from "@/store/slices/order-history-filter";
import { createTestStore, type TestStore } from "@/test/store";

const ALMOST: number = SEARCH_DEBOUNCE_MS - 1;

function filterOf(store: AppStore): HistoryFilterState {
  return selectOrderHistoryFilter(store.getState());
}

beforeEach((): void => {
  vi.useFakeTimers();
});

afterEach((): void => {
  vi.useRealTimers();
});

describe("order history search listener", () => {
  it("applies the search once the typing settles, back on the first page", async () => {
    const { store }: TestStore = createTestStore();
    store.dispatch(pageChanged(3));

    store.dispatch(searchChanged(" 1042 "));
    await vi.advanceTimersByTimeAsync(ALMOST);
    const whileTyping: HistoryFilterState = filterOf(store);
    await vi.advanceTimersByTimeAsync(1);

    expect(whileTyping.appliedSearch).toBe("");
    expect(filterOf(store)).toMatchObject({ appliedSearch: "1042", page: FIRST_PAGE });
  });

  it("waits again after each keystroke and applies only the last text", async () => {
    const { store }: TestStore = createTestStore();

    store.dispatch(searchChanged("an"));
    await vi.advanceTimersByTimeAsync(ALMOST);
    store.dispatch(searchChanged("ana"));
    await vi.advanceTimersByTimeAsync(ALMOST);
    const beforeSettling: string = filterOf(store).appliedSearch;
    await vi.advanceTimersByTimeAsync(1);

    expect(beforeSettling).toBe("");
    expect(filterOf(store).appliedSearch).toBe("ana");
  });

  it("applies nothing when the filters were cleared before the typing settled", async () => {
    const { store }: TestStore = createTestStore();

    store.dispatch(searchChanged("ana"));
    store.dispatch(filtersCleared());
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);

    expect(filterOf(store)).toMatchObject({ search: "", appliedSearch: "" });
  });
});
