import type { ListProductsParams } from "@/@types/catalog";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { toSortParam } from "@/utils/sort-param";
import type { ProductsFilterState } from "../filter/types";

export function toListProductsParams({
  appliedSearch,
  categoryId,
  status,
  page,
  pageSize,
  sort,
}: ProductsFilterState): ListProductsParams {
  const search: string = appliedSearch.trim();
  return {
    ...(search === EMPTY_SEARCH ? {} : { search }),
    ...(categoryId === ALL_FILTER ? {} : { categoryId }),
    ...(status === ALL_FILTER ? {} : { status }),
    page,
    pageSize,
    sort: [toSortParam(sort)],
  };
}
