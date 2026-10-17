import type { CatalogStatus } from "@/@types/catalog";

export const CATALOG_STATUSES = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const satisfies Record<CatalogStatus, CatalogStatus>;

export const CATALOG_STATUS_LIST: readonly CatalogStatus[] = Object.values(CATALOG_STATUSES);

export const PRODUCT_NAME_MIN_LENGTH: number = 2;

export const PRODUCT_NAME_MAX_LENGTH: number = 80;

export const PRODUCT_DESCRIPTION_MAX_LENGTH: number = 300;

export const PRODUCT_PRICE_MAX: number = 9999.99;

export const CATEGORY_NAME_MIN_LENGTH: number = 2;

export const CATEGORY_NAME_MAX_LENGTH: number = 60;

export const DISPLAY_ORDER_MIN: number = 0;

export const DISPLAY_ORDER_MAX: number = 999;
