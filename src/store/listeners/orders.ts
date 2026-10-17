import { toast } from "sonner";
import type { OrderId, StaffOrderPage, StaffOrderSummary } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";
import { ORDER_STATUSES } from "@/constants/orders";
import { ordersApi } from "@/services/orders";
import type { AppStartListening, RootState } from "@/store";

interface BoardListenerApi {
  getOriginalState: () => RootState;
}

const selectBoard = ordersApi.endpoints.getOrderBoard.select();

function newReceivedOrders(
  previous: StaffOrderPage | undefined,
  current: StaffOrderPage,
): StaffOrderSummary[] {
  if (previous === undefined) {
    return [];
  }
  const known: ReadonlySet<OrderId> = new Set<OrderId>(
    previous.data.map((order: StaffOrderSummary): OrderId => order.id),
  );
  return current.data.filter(
    (order: StaffOrderSummary): boolean =>
      order.status === ORDER_STATUSES.RECEIVED && !known.has(order.id),
  );
}

export function listenForNewOrders(startListening: AppStartListening): void {
  startListening({
    matcher: ordersApi.endpoints.getOrderBoard.matchFulfilled,
    effect: (action: { payload: StaffOrderPage }, { getOriginalState }: BoardListenerApi): void => {
      const previous: StaffOrderPage | undefined = selectBoard(getOriginalState()).data;
      newReceivedOrders(previous, action.payload).forEach((order: StaffOrderSummary): void => {
        toast(MESSAGES.ORDERS.NEW_ORDER(order.number));
      });
    },
  });
}
