import { useMemo } from "react";
import { HTTP_STATUS } from "@/constants/api";
import { useIdParam } from "@/hooks/use-id-param";
import { myOrdersApi, useGetMyOrderQuery } from "@/services/my-orders";
import { extractApiError, type ApiErrorInfo } from "@/utils/api-error";
import { livePolling } from "@/utils/live-polling";
import type { MyOrderModel } from "../types";

export function useMyOrder(): MyOrderModel {
  const id: string = useIdParam();
  const { data: cached } = myOrdersApi.endpoints.getMyOrder.useQueryState(id);
  const { data, error, isLoading } = useGetMyOrderQuery(id, livePolling(cached?.live ?? false));
  const failure: ApiErrorInfo | null = useMemo(
    (): ApiErrorInfo | null =>
      error === undefined || data !== undefined ? null : extractApiError(error),
    [error, data],
  );
  const notFound: boolean = failure?.status === HTTP_STATUS.NOT_FOUND;

  return {
    order: data,
    loading: isLoading,
    notFound,
    loadError: failure === null || notFound ? null : failure.detail,
  };
}
