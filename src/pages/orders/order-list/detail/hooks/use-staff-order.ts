import { useMemo } from "react";
import { HTTP_STATUS } from "@/constants/api";
import { useIdParam } from "@/hooks/use-id-param";
import { ordersApi, useGetOrderQuery } from "@/services/orders";
import { extractApiError, type ApiErrorInfo } from "@/utils/api-error";
import { livePolling } from "@/utils/live-polling";
import type { StaffOrderModel } from "../types";

export function useStaffOrder(): StaffOrderModel {
  const id: string = useIdParam();
  const { data: cached } = ordersApi.endpoints.getOrder.useQueryState(id);
  const { data, error, isLoading } = useGetOrderQuery(id, livePolling(cached?.live ?? false));
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
