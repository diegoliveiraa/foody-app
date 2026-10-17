import type { CartQuote, QuotedItem } from "@/@types/menu";
import { MESSAGES } from "@/constants/messages";
import { CHECKOUT_MESSAGES } from "../constants/messages";
import type { SummaryLine } from "../types";

export function toSummaryLines(quote: CartQuote | undefined): SummaryLine[] {
  return (quote?.items ?? []).map((item: QuotedItem): SummaryLine => ({
    productId: item.productId,
    label: MESSAGES.ORDERS.ITEM_LINE(item.quantity, item.name ?? CHECKOUT_MESSAGES.UNKNOWN_PRODUCT),
    subtotal: item.subtotal ?? null,
    available: item.available,
  }));
}
