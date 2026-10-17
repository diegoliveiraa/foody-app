import type { UserRole, UserStatus } from "@/@types/users";
import type { PageSize } from "@/constants/pagination";
import type { SortOrder } from "@/utils/sort-param";
import type { ALL_FILTER } from "../constants";

export type AllFilter = typeof ALL_FILTER;

export type RoleFilter = UserRole | AllFilter;

export type StatusFilter = UserStatus | AllFilter;

export interface UsersFilterState {
  search: string;
  appliedSearch: string;
  role: RoleFilter;
  status: StatusFilter;
  page: number;
  pageSize: PageSize;
  sort: SortOrder;
}

export interface UsersFilterActions {
  changeSearch: (search: string) => void;
  changeRole: (role: RoleFilter) => void;
  changeStatus: (status: StatusFilter) => void;
  changePage: (page: number) => void;
  changePageSize: (pageSize: PageSize) => void;
  changeSort: (sort: SortOrder) => void;
  clearFilters: () => void;
}

export interface UsersFilterModel {
  filter: UsersFilterState;
  actions: UsersFilterActions;
  hasFilters: boolean;
}
