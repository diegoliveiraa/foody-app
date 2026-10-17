import type { Product } from "@/@types/catalog";
import { ERROR_CODES } from "@/constants/api";
import { CATALOG_STATUS_LIST } from "@/constants/catalog";
import { ALL_FILTER } from "@/constants/filters";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import type { ProductField } from "@/services/validation-schemas/product";
import type { SortOrder } from "@/utils/sort-param";
import type { StatusFilter } from "../filter/types";

export const PRODUCTS_FILTER_NAME: string = "productsFilter";

export const STATUS_FILTERS: readonly StatusFilter[] = [ALL_FILTER, ...CATALOG_STATUS_LIST];

export const PRODUCT_COLUMNS = {
  NAME: "name",
  CATEGORY: "category",
  PRICE: "price",
  STATUS: "status",
  CREATED_AT: "createdAt",
  ACTIONS: "actions",
} as const;

export const DEFAULT_PRODUCT_SORT: SortOrder = {
  property: PRODUCT_COLUMNS.NAME,
  direction: SORT_DIRECTIONS.ASC,
};

export const PRODUCT_DIALOGS = {
  DISABLE: "disable",
  DELETE: "delete",
} as const;

export const PRODUCT_ERROR_FIELDS: Readonly<Partial<Record<string, ProductField>>> = {
  [ERROR_CODES.UNKNOWN_CATEGORY]: "categoryId",
};

export const NO_PRODUCTS: readonly Product[] = [];

export const SKELETON_CARDS: number = 3;
