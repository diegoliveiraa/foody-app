import { z } from "zod";
import {
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  DISPLAY_ORDER_MAX,
  DISPLAY_ORDER_MIN,
} from "@/constants/catalog";
import { MESSAGES } from "@/constants/messages";

const WHOLE_NUMBER_PATTERN: RegExp = /^\d+$/;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(CATEGORY_NAME_MIN_LENGTH, { error: MESSAGES.VALIDATION.CATEGORY_NAME_LENGTH })
    .max(CATEGORY_NAME_MAX_LENGTH, { error: MESSAGES.VALIDATION.CATEGORY_NAME_LENGTH }),
  displayOrder: z
    .string()
    .trim()
    .regex(WHOLE_NUMBER_PATTERN, { error: MESSAGES.VALIDATION.DISPLAY_ORDER_RANGE })
    .transform(Number)
    .pipe(
      z
        .int()
        .min(DISPLAY_ORDER_MIN, { error: MESSAGES.VALIDATION.DISPLAY_ORDER_RANGE })
        .max(DISPLAY_ORDER_MAX, { error: MESSAGES.VALIDATION.DISPLAY_ORDER_RANGE }),
    ),
});

export type CategoryFormInput = z.input<typeof categorySchema>;

export type CategoryFormValues = z.output<typeof categorySchema>;

export type CategoryField = keyof CategoryFormInput;

export const CATEGORY_FIELDS: readonly CategoryField[] = categorySchema.keyof().options;
