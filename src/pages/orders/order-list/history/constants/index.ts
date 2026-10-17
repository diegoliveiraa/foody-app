import type { StaffOrderSummary } from "@/@types/orders";
import { ALL_FILTER } from "@/constants/filters";
import { ORDER_SORT_PROPERTIES, ORDER_STATUS_LIST } from "@/constants/orders";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import type { SortOrder } from "@/utils/sort-param";
import type { StatusFilter } from "../filter/types";

export const HISTORY_FILTER_NAME: string = "orderHistoryFilter";

export const NO_DATE: string = "";

export const STATUS_FILTERS: readonly StatusFilter[] = [ALL_FILTER, ...ORDER_STATUS_LIST];

export const HISTORY_COLUMNS = {
  NUMBER: ORDER_SORT_PROPERTIES.NUMBER,
  CUSTOMER: "customerName",
  ITEMS: "items",
  TOTAL: ORDER_SORT_PROPERTIES.TOTAL,
  STATUS: "status",
  PLACED_AT: ORDER_SORT_PROPERTIES.PLACED_AT,
} as const;

export const DEFAULT_HISTORY_SORT: SortOrder = {
  property: ORDER_SORT_PROPERTIES.PLACED_AT,
  direction: SORT_DIRECTIONS.DESC,
};

export const NO_ORDERS: readonly StaffOrderSummary[] = [];

export const SKELETON_CARDS: number = 3;
