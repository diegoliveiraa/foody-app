import type { StaffOrderSummary } from "@/@types/orders";
import { BOARD_STATUSES, type BoardStatus } from "@/constants/orders";
import { CARD_OFFERS_CANCEL } from "../constants";
import type { BoardColumn } from "../types";

export function toBoardColumns(orders: readonly StaffOrderSummary[]): BoardColumn[] {
  return BOARD_STATUSES.map((status: BoardStatus): BoardColumn => ({
    status,
    orders: orders.filter((order: StaffOrderSummary): boolean => order.status === status),
    showsCancel: CARD_OFFERS_CANCEL[status],
  }));
}
