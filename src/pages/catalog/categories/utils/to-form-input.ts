import type { Category } from "@/@types/catalog";
import { DISPLAY_ORDER_MAX, DISPLAY_ORDER_MIN } from "@/constants/catalog";
import { EMPTY_TEXT } from "@/constants/validation";
import type { CategoryFormInput } from "@/services/validation-schemas/category";

const NEXT_STEP: number = 1;

export function toCategoryFormInput(category: Category): CategoryFormInput {
  return { name: category.name, displayOrder: String(category.displayOrder) };
}

function nextDisplayOrder(categories: readonly Category[]): number {
  if (categories.length === 0) {
    return DISPLAY_ORDER_MIN;
  }
  const last: number = Math.max(
    ...categories.map((category: Category): number => category.displayOrder),
  );
  return Math.min(last + NEXT_STEP, DISPLAY_ORDER_MAX);
}

export function newCategoryFormInput(categories: readonly Category[]): CategoryFormInput {
  return { name: EMPTY_TEXT, displayOrder: String(nextDisplayOrder(categories)) };
}
