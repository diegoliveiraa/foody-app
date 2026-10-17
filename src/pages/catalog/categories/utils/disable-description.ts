import { NO_PRODUCT, ONE_PRODUCT, PRODUCT_COUNT_KINDS } from "../constants";
import { CATEGORIES_MESSAGES } from "../constants/messages";
import type { ProductCountKind } from "../types";

const KINDS_BY_COUNT: Partial<Record<number, ProductCountKind>> = {
  [NO_PRODUCT]: PRODUCT_COUNT_KINDS.NONE,
  [ONE_PRODUCT]: PRODUCT_COUNT_KINDS.ONE,
};

export function disableDescriptionOf(count: number): string {
  const kind: ProductCountKind = KINDS_BY_COUNT[count] ?? PRODUCT_COUNT_KINDS.MANY;
  return CATEGORIES_MESSAGES.DISABLE_DIALOG.DESCRIPTIONS[kind](count);
}
