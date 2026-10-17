import { useMemo } from "react";
import { useReload } from "@/hooks/use-reload";
import { useGetOrderBoardQuery } from "@/services/orders";
import { extractApiError } from "@/utils/api-error";
import { livePolling } from "@/utils/live-polling";
import { ORDER_LIST_TAGS } from "../../constants";
import { NO_ORDERS } from "../constants";
import type { BoardColumn, OrderBoardModel, PendingRequests } from "../types";
import { toBoardColumns } from "../utils/board-columns";
import { pendingRequestsOf } from "../utils/pending-requests";

export function useOrderBoard(): OrderBoardModel {
  const { data, error, isLoading, isFetching, fulfilledTimeStamp } = useGetOrderBoardQuery(
    undefined,
    livePolling(true),
  );
  const reload: () => void = useReload(ORDER_LIST_TAGS);
  const columns: readonly BoardColumn[] = useMemo(
    (): BoardColumn[] => toBoardColumns(data?.data ?? NO_ORDERS),
    [data],
  );
  const pendingRequests: PendingRequests | null = useMemo(
    (): PendingRequests | null => pendingRequestsOf(data?.data ?? NO_ORDERS),
    [data],
  );
  const loadError: string | null = useMemo(
    (): string | null =>
      error === undefined || data !== undefined ? null : extractApiError(error).detail,
    [error, data],
  );

  return {
    columns,
    loading: isLoading,
    loadError,
    refreshing: isFetching,
    updatedAt: fulfilledTimeStamp ?? null,
    pendingRequests,
    reload,
  };
}
