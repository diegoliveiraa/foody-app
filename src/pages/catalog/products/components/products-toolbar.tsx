import type { JSX } from "react";
import { FilterSelect } from "@/components/filter-select";
import { SearchInput } from "@/components/search-input";
import { STATUS_FILTERS } from "../constants";
import { PRODUCTS_MESSAGES, STATUS_FILTER_LABELS } from "../constants/messages";
import type {
  CategoryFilter,
  ProductsFilterActions,
  ProductsFilterState,
  StatusFilter,
} from "../filter/types";
import type { ProductCategoryOptions } from "../types";

interface ProductsToolbarProps {
  filter: ProductsFilterState;
  actions: ProductsFilterActions;
  categories: ProductCategoryOptions;
}

export function ProductsToolbar({
  filter,
  actions,
  categories,
}: ProductsToolbarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SearchInput
        label={PRODUCTS_MESSAGES.SEARCH}
        value={filter.search}
        onValueChange={actions.changeSearch}
        className="lg:max-w-sm lg:flex-1"
      />
      <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,3fr)] gap-3 lg:flex">
        <FilterSelect<CategoryFilter>
          label={PRODUCTS_MESSAGES.CATEGORY_FILTER}
          value={filter.categoryId}
          options={categories.filterOptions}
          labels={categories.filterLabels}
          onChange={actions.changeCategory}
          className="lg:w-56"
        />
        <FilterSelect<StatusFilter>
          label={PRODUCTS_MESSAGES.STATUS_FILTER}
          value={filter.status}
          options={STATUS_FILTERS}
          labels={STATUS_FILTER_LABELS}
          onChange={actions.changeStatus}
        />
      </div>
    </div>
  );
}
