import type { CartItem, CartQuote, MenuCategory, MenuProduct, QuotedItem } from "@/@types/menu";
import { CART_MAX_QUANTITY } from "@/constants/cart";
import { MENU_MESSAGES } from "../constants/messages";
import type { BagLine } from "../types";

export function productNamesOf(categories: readonly MenuCategory[]): ReadonlyMap<string, string> {
  return new Map<string, string>(
    categories.flatMap((category: MenuCategory): [string, string][] =>
      category.products.map((product: MenuProduct): [string, string] => [product.id, product.name]),
    ),
  );
}

function quotedById(quote: CartQuote | undefined): ReadonlyMap<string, QuotedItem> {
  return new Map<string, QuotedItem>(
    (quote?.items ?? []).map((item: QuotedItem): [string, QuotedItem] => [item.productId, item]),
  );
}

export function toBagLines(
  items: readonly CartItem[],
  quote: CartQuote | undefined,
  names: ReadonlyMap<string, string>,
): BagLine[] {
  const quoted: ReadonlyMap<string, QuotedItem> = quotedById(quote);
  return items.map((item: CartItem): BagLine => {
    const line: QuotedItem | undefined = quoted.get(item.productId);
    return {
      productId: item.productId,
      name: line?.name ?? names.get(item.productId) ?? MENU_MESSAGES.BAG.UNKNOWN_PRODUCT,
      quantity: item.quantity,
      unitPrice: line?.unitPrice ?? null,
      subtotal: line?.subtotal ?? null,
      available: line?.available ?? true,
      canIncrease: item.quantity < CART_MAX_QUANTITY,
    };
  });
}
