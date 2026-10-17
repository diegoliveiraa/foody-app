import { z } from "zod";
import type { CartItem } from "@/@types/menu";
import { CART_MAX_DISTINCT_PRODUCTS, CART_MAX_QUANTITY, CART_MIN_QUANTITY } from "@/constants/cart";
import { REQUIRED_MIN_LENGTH } from "@/constants/validation";

function hasDistinctProducts(items: readonly CartItem[]): boolean {
  return new Set(items.map(({ productId }: CartItem): string => productId)).size === items.length;
}

export const storedCartSchema = z
  .array(
    z.object({
      productId: z.string().min(REQUIRED_MIN_LENGTH),
      quantity: z.int().min(CART_MIN_QUANTITY).max(CART_MAX_QUANTITY),
    }),
  )
  .max(CART_MAX_DISTINCT_PRODUCTS)
  .refine(hasDistinctProducts);
