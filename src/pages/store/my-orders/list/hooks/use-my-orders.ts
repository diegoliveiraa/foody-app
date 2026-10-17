import { useMemo } from "react";
import type { CustomerOrderPage, CustomerOrderSummary } from "@/@types/orders";
import { useNotifyError } from "@/hooks/use-notify-error";
import { useListMyOrdersInfiniteQuery } from "@/services/my-orders";
import { extractApiError } from "@/utils/api-error";
import { NO_ORDERS } from "../constants";
import type { MyOrdersModel } from "../types";

export function useMyOrders(): MyOrdersModel {
  const { data, error, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useListMyOrdersInfiniteQuery();
  const notifyError: (error: unknown) => void = useNotifyError();
  const orders: readonly CustomerOrderSummary[] = useMemo(
    (): readonly CustomerOrderSummary[] =>
      data?.pages.flatMap((page: CustomerOrderPage): CustomerOrderSummary[] => page.data) ??
      NO_ORDERS,
    [data],
  );
  const loadError: string | null = useMemo(
    (): string | null =>
      error === undefined || data !== undefined ? null : extractApiError(error).detail,
    [error, data],
  );

  const loadMore = (): void => {
    fetchNextPage().unwrap().catch(notifyError);
  };

  return {
    orders,
    loading: isLoading,
    loadError,
    hasMore: hasNextPage,
    loadingMore: isFetchingNextPage,
    loadMore,
  };
}
