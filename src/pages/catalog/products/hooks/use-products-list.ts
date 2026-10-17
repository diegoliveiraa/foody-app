import { useMemo } from "react";
import type { ListProductsParams, Product } from "@/@types/catalog";
import { useListProductsQuery } from "@/services/catalog";
import { extractApiError } from "@/utils/api-error";
import { NO_PRODUCTS } from "../constants";
import { useProductsFilter } from "../filter/hooks/use-products-filter";
import type { ProductsFilterModel } from "../filter/types";
import type { ProductsListModel } from "../types";
import { toListProductsParams } from "../utils/to-list-params";

export function useProductsList(): ProductsListModel {
  const { filter, actions, hasFilters }: ProductsFilterModel = useProductsFilter();
  const params: ListProductsParams = useMemo(
    (): ListProductsParams => toListProductsParams(filter),
    [filter],
  );
  const { data, error, isLoading, isFetching } = useListProductsQuery(params);
  const products: readonly Product[] = data?.data ?? NO_PRODUCTS;
  const loadError: string | null = useMemo(
    (): string | null => (error === undefined ? null : extractApiError(error).detail),
    [error],
  );

  return {
    filter,
    actions,
    hasFilters,
    products,
    pagination: loadError === null && data !== undefined && products.length > 0 ? data.meta : null,
    loading: isLoading,
    refreshing: isFetching && !isLoading,
    loadError,
  };
}
