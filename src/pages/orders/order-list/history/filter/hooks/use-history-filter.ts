import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import type { PageSize } from "@/constants/pagination";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import type { AppDispatch } from "@/store";
import {
  filtersCleared,
  fromChanged,
  isInvertedRange,
  pageChanged,
  pageSizeChanged,
  searchChanged,
  selectOrderHistoryFilter,
  sortChanged,
  statusChanged,
  toChanged,
} from "@/store/slices/order-history-filter";
import type { SortOrder } from "@/utils/sort-param";
import { NO_DATE } from "../../constants";
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
  const filter: HistoryFilterState = useSelector(selectOrderHistoryFilter);
  const dispatch: AppDispatch = useAppDispatch();
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
    [dispatch],
  );

  return {
    filter,
    actions,
    hasFilters: hasFiltersIn(filter),
    invertedRange: isInvertedRange(filter.from, filter.to),
  };
}
