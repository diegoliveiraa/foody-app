import type { OrderItemSummary } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";

const NO_UNITS: number = 0;

export function summarizeItems(items: readonly OrderItemSummary[]): string {
  return items
    .map((item: OrderItemSummary): string =>
      MESSAGES.ORDERS.ITEM_LINE(item.quantity, item.productName),
    )
    .join(MESSAGES.ORDERS.ITEMS_SEPARATOR);
}

export function countUnits(items: readonly OrderItemSummary[]): number {
  return items.reduce(
    (units: number, item: OrderItemSummary): number => units + item.quantity,
    NO_UNITS,
  );
}
