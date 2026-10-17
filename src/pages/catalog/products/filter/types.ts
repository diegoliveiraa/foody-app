import type { CatalogStatus, Category } from "@/@types/catalog";
import type { AllFilter } from "@/constants/filters";
import type { PageSize } from "@/constants/pagination";
import type { SortOrder } from "@/utils/sort-param";

export type CategoryFilter = Category["id"];

export type StatusFilter = CatalogStatus | AllFilter;

export interface ProductsFilterState {
  search: string;
  appliedSearch: string;
  categoryId: CategoryFilter;
  status: StatusFilter;
  page: number;
  pageSize: PageSize;
  sort: SortOrder;
}

export interface ProductsFilterActions {
  changeSearch: (search: string) => void;
  changeCategory: (categoryId: CategoryFilter) => void;
  changeStatus: (status: StatusFilter) => void;
  changePage: (page: number) => void;
  changePageSize: (pageSize: PageSize) => void;
  changeSort: (sort: SortOrder) => void;
  clearFilters: () => void;
}

export interface ProductsFilterModel {
  filter: ProductsFilterState;
  actions: ProductsFilterActions;
  hasFilters: boolean;
}
