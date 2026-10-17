import { useMemo, useReducer } from "react";
import { ALL_FILTER, EMPTY_SEARCH, SEARCH_DEBOUNCE_MS } from "@/constants/filters";
import type { PageSize } from "@/constants/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { settledSearchToApply } from "@/utils/settled-search";
import type { SortOrder } from "@/utils/sort-param";
import {
  filtersCleared,
  INITIAL_USERS_FILTER,
  pageChanged,
  pageSizeChanged,
  roleChanged,
  searchApplied,
  searchChanged,
  sortChanged,
  statusChanged,
  usersFilterReducer,
} from "../index";
import type {
  RoleFilter,
  StatusFilter,
  UsersFilterActions,
  UsersFilterModel,
  UsersFilterState,
} from "../types";

function hasFiltersIn({ search, appliedSearch, role, status }: UsersFilterState): boolean {
  return (
    search.trim() !== EMPTY_SEARCH ||
    appliedSearch !== EMPTY_SEARCH ||
    role !== ALL_FILTER ||
    status !== ALL_FILTER
  );
}

export function useUsersFilter(): UsersFilterModel {
  const [filter, dispatch] = useReducer(usersFilterReducer, INITIAL_USERS_FILTER);
  const settledSearch: string = useDebouncedValue(filter.search, SEARCH_DEBOUNCE_MS);
  const searchToApply: string | null = settledSearchToApply(filter, settledSearch);
  if (searchToApply !== null) {
    dispatch(searchApplied(searchToApply));
  }
  const actions: UsersFilterActions = useMemo(
    (): UsersFilterActions => ({
      changeSearch: (search: string): void => {
        dispatch(searchChanged(search));
      },
      changeRole: (role: RoleFilter): void => {
        dispatch(roleChanged(role));
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
