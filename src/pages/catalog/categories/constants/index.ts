import type { Category } from "@/@types/catalog";
import { ERROR_CODES } from "@/constants/api";
import type { CategoryField } from "@/services/validation-schemas/category";

export const CATEGORY_COLUMNS = {
  NAME: "name",
  DISPLAY_ORDER: "displayOrder",
  PRODUCT_COUNT: "productCount",
  STATUS: "status",
  ACTIONS: "actions",
} as const;

export const CATEGORY_DIALOGS = {
  DISABLE: "disable",
  DELETE: "delete",
} as const;

export const PRODUCT_COUNT_KINDS = {
  NONE: "none",
  ONE: "one",
  MANY: "many",
} as const;

export const NO_PRODUCT: number = 0;

export const ONE_PRODUCT: number = 1;

export const CATEGORY_ERROR_FIELDS: Readonly<Partial<Record<string, CategoryField>>> = {
  [ERROR_CODES.CATEGORY_NAME_TAKEN]: "name",
};

export const NO_CATEGORIES: readonly Category[] = [];

export const SKELETON_CARDS: number = 3;
