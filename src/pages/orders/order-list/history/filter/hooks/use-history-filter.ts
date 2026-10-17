import { useMemo, useReducer } from "react";
import { ALL_FILTER, EMPTY_SEARCH, SEARCH_DEBOUNCE_MS } from "@/constants/filters";
import type { PageSize } from "@/constants/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { settledSearchToApply } from "@/utils/settled-search";
import type { SortOrder } from "@/utils/sort-param";
import { NO_DATE } from "../../constants";
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
} from "../index";
import type {
  HistoryFilterActions,
  HistoryFilterModel,
  HistoryFilterState,
  StatusFilter,
} from "../types";

function hasFiltersIn({ search, appliedSearch, status, from, to }: HistoryFilterState): boolean {
  return (
    search.trim() !== EMPTY_SEARCH ||
    appliedSearch !== EMPTY_SEARCH ||
    status !== ALL_FILTER ||
    from !== NO_DATE ||
    to !== NO_DATE
  );
}

export function useHistoryFilter(): HistoryFilterModel {
  const [filter, dispatch] = useReducer(historyFilterReducer, INITIAL_HISTORY_FILTER);
  const settledSearch: string = useDebouncedValue(filter.search, SEARCH_DEBOUNCE_MS);
  const searchToApply: string | null = settledSearchToApply(filter, settledSearch);
  if (searchToApply !== null) {
    dispatch(searchApplied(searchToApply));
  }
  const actions: HistoryFilterActions = useMemo(
    (): HistoryFilterActions => ({
      changeSearch: (search: string): void => {
        dispatch(searchChanged(search));
      },
      changeStatus: (status: StatusFilter): void => {
        dispatch(statusChanged(status));
      },
      changeFrom: (from: string): void => {
        dispatch(fromChanged(from));
      },
      changeTo: (to: string): void => {
        dispatch(toChanged(to));
      },
      changePage: (page: number): void => {
        dispatch(pageChanged(page));
      },
      changePageSize: (pageSize: PageSize): void => {
        dispatch(pageSizeChanged(pageSize));
      },
      changeSort: (sort: SortOrder): void => {
        dispatch(sortChanged(sort));
      },
      clearFilters: (): void => {
        dispatch(filtersCleared());
      },
    }),
    [],
  );

  return { filter, actions, hasFilters: hasFiltersIn(filter) };
}
