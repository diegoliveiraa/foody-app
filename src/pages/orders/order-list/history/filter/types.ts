import type { OrderStatus } from "@/@types/orders";
import type { AllFilter } from "@/constants/filters";
import type { PageSize } from "@/constants/pagination";
import type { SortOrder } from "@/utils/sort-param";

export type StatusFilter = OrderStatus | AllFilter;

export interface HistoryFilterState {
  search: string;
  appliedSearch: string;
  status: StatusFilter;
  from: string;
  to: string;
  page: number;
  pageSize: PageSize;
  sort: SortOrder;
}

export interface HistoryFilterActions {
  changeSearch: (search: string) => void;
  changeStatus: (status: StatusFilter) => void;
  changeFrom: (from: string) => void;
  changeTo: (to: string) => void;
  changePage: (page: number) => void;
  changePageSize: (pageSize: PageSize) => void;
  changeSort: (sort: SortOrder) => void;
  clearFilters: () => void;
}

export interface HistoryFilterModel {
  filter: HistoryFilterState;
  actions: HistoryFilterActions;
  hasFilters: boolean;
}
