import { useMemo } from "react";
import type { ListOrdersParams, StaffOrderSummary } from "@/@types/orders";
import { useListOrdersQuery } from "@/services/orders";
import { extractApiError } from "@/utils/api-error";
import { NO_ORDERS } from "../constants";
import { useHistoryFilter } from "../filter/hooks/use-history-filter";
import type { HistoryFilterModel } from "../filter/types";
import type { OrderHistoryModel } from "../types";
import { toListOrdersParams } from "../utils/to-list-params";

export function useOrderHistory(): OrderHistoryModel {
  const { filter, actions, hasFilters, invertedRange }: HistoryFilterModel = useHistoryFilter();
  const params: ListOrdersParams = useMemo(
    (): ListOrdersParams => toListOrdersParams(filter),
    [filter],
  );
  const { data, error, isLoading, isFetching } = useListOrdersQuery(params);
  const orders: readonly StaffOrderSummary[] = data?.data ?? NO_ORDERS;
  const loadError: string | null = useMemo(
    (): string | null => (error === undefined ? null : extractApiError(error).detail),
    [error],
  );

  return {
    filter,
    actions,
    hasFilters,
    invertedRange,
    orders,
    pagination: loadError === null && data !== undefined && orders.length > 0 ? data.meta : null,
    loading: isLoading,
    refreshing: isFetching && !isLoading,
    loadError,
  };
}
