import { z } from "zod";
import {
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_MAX,
} from "@/constants/catalog";
import { DECIMAL_COMMA, DECIMAL_POINT } from "@/constants/locale";
import { MESSAGES } from "@/constants/messages";
import { EMPTY_TEXT, REQUIRED_MIN_LENGTH } from "@/constants/validation";

const PRICE_PATTERN: RegExp = /^\d+([.,]\d{1,2})?$/;

const NO_PRICE: number = 0;

function toPrice(typed: string): number {
  return Number(typed.replace(DECIMAL_COMMA, DECIMAL_POINT));
}

function toDescription(description: string): string | null {
  return description === EMPTY_TEXT ? null : description;
}

const priceField = z
  .string()
  .trim()
  .min(REQUIRED_MIN_LENGTH, { error: MESSAGES.VALIDATION.PRICE_REQUIRED, abort: true })
  .regex(PRICE_PATTERN, { error: MESSAGES.VALIDATION.PRICE_INVALID })
  .transform(toPrice)
  .pipe(
    z
      .number()
      .gt(NO_PRICE, { error: MESSAGES.VALIDATION.PRICE_POSITIVE })
      .max(PRODUCT_PRICE_MAX, { error: MESSAGES.VALIDATION.PRICE_TOO_HIGH }),
  );

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(PRODUCT_NAME_MIN_LENGTH, { error: MESSAGES.VALIDATION.PRODUCT_NAME_LENGTH })
    .max(PRODUCT_NAME_MAX_LENGTH, { error: MESSAGES.VALIDATION.PRODUCT_NAME_LENGTH }),
  description: z
    .string()
    .trim()
    .max(PRODUCT_DESCRIPTION_MAX_LENGTH, { error: MESSAGES.VALIDATION.DESCRIPTION_TOO_LONG })
    .transform(toDescription),
  price: priceField,
  categoryId: z.string().min(REQUIRED_MIN_LENGTH, { error: MESSAGES.VALIDATION.CATEGORY_REQUIRED }),
});

export type ProductFormInput = z.input<typeof productSchema>;

export type ProductFormValues = z.output<typeof productSchema>;

export type ProductField = keyof ProductFormInput;

export const PRODUCT_FIELDS: readonly ProductField[] = productSchema.keyof().options;
