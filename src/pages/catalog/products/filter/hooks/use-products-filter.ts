import { useMemo, useReducer } from "react";
import { ALL_FILTER, EMPTY_SEARCH, SEARCH_DEBOUNCE_MS } from "@/constants/filters";
import type { PageSize } from "@/constants/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { settledSearchToApply } from "@/utils/settled-search";
import type { SortOrder } from "@/utils/sort-param";
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
} from "../index";
import type {
  CategoryFilter,
  ProductsFilterActions,
  ProductsFilterModel,
  ProductsFilterState,
  StatusFilter,
} from "../types";

function hasFiltersIn({ search, appliedSearch, categoryId, status }: ProductsFilterState): boolean {
  return (
    search.trim() !== EMPTY_SEARCH ||
    appliedSearch !== EMPTY_SEARCH ||
    categoryId !== ALL_FILTER ||
    status !== ALL_FILTER
  );
}

export function useProductsFilter(): ProductsFilterModel {
  const [filter, dispatch] = useReducer(productsFilterReducer, INITIAL_PRODUCTS_FILTER);
  const settledSearch: string = useDebouncedValue(filter.search, SEARCH_DEBOUNCE_MS);
  const searchToApply: string | null = settledSearchToApply(filter, settledSearch);
  if (searchToApply !== null) {
    dispatch(searchApplied(searchToApply));
  }
  const actions: ProductsFilterActions = useMemo(
    (): ProductsFilterActions => ({
      changeSearch: (search: string): void => {
        dispatch(searchChanged(search));
      },
      changeCategory: (categoryId: CategoryFilter): void => {
        dispatch(categoryChanged(categoryId));
      },
      changeStatus: (status: StatusFilter): void => {
        dispatch(statusChanged(status));
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
