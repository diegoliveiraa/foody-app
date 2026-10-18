import type { Product } from "@/@types/catalog";
import { ERROR_CODES } from "@/constants/api";
import { CATALOG_STATUS_LIST } from "@/constants/catalog";
import { ALL_FILTER } from "@/constants/filters";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import type { ProductField } from "@/services/validation-schemas/product";
import type { SortOption } from "@/utils/sort-options";
import type { SortOrder } from "@/utils/sort-param";
import type { StatusFilter } from "../filter/types";
import { PRODUCTS_MESSAGES } from "./messages";

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

export const PRODUCT_SORT_OPTIONS: readonly SortOption[] = [
  { label: PRODUCTS_MESSAGES.SORT_OPTIONS.NAME_ASC, sort: DEFAULT_PRODUCT_SORT },
  {
    label: PRODUCTS_MESSAGES.SORT_OPTIONS.NAME_DESC,
    sort: { property: PRODUCT_COLUMNS.NAME, direction: SORT_DIRECTIONS.DESC },
  },
  {
    label: PRODUCTS_MESSAGES.SORT_OPTIONS.LOWEST_PRICE,
    sort: { property: PRODUCT_COLUMNS.PRICE, direction: SORT_DIRECTIONS.ASC },
  },
  {
    label: PRODUCTS_MESSAGES.SORT_OPTIONS.HIGHEST_PRICE,
    sort: { property: PRODUCT_COLUMNS.PRICE, direction: SORT_DIRECTIONS.DESC },
  },
  {
    label: PRODUCTS_MESSAGES.SORT_OPTIONS.NEWEST,
    sort: { property: PRODUCT_COLUMNS.CREATED_AT, direction: SORT_DIRECTIONS.DESC },
  },
];

export const PRODUCT_DIALOGS = {
  DISABLE: "disable",
  DELETE: "delete",
} as const;

export const PRODUCT_ERROR_FIELDS: Readonly<Partial<Record<string, ProductField>>> = {
  [ERROR_CODES.UNKNOWN_CATEGORY]: "categoryId",
};

export const NO_PRODUCTS: readonly Product[] = [];

export const SKELETON_CARDS: number = 3;
