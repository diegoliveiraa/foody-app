import { skipToken } from "@reduxjs/toolkit/query";
import type { DeliveryAddress, OrderId } from "@/@types/orders";
import { useGetMyOrderQuery, useListMyOrdersInfiniteQuery } from "@/services/my-orders";

export function useLastDeliveryAddress(skip: boolean): DeliveryAddress | undefined {
  const { data: orders } = useListMyOrdersInfiniteQuery(skip ? skipToken : undefined);
  const lastOrderId: OrderId | undefined = orders?.pages[0]?.data[0]?.id;
  const { data: lastOrder } = useGetMyOrderQuery(lastOrderId ?? skipToken);
  return lastOrder?.deliveryAddress;
}
