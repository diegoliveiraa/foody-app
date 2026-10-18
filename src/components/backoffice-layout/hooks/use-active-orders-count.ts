import { ordersApi } from "@/services/orders";

const NO_ACTIVE_ORDERS: number = 0;

export function useActiveOrdersCount(): number {
  const { data } = ordersApi.endpoints.getOrderBoard.useQueryState(undefined);
  return data?.meta.totalItems ?? NO_ACTIVE_ORDERS;
}
