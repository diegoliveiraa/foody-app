import type { TagDescription } from "@reduxjs/toolkit/query";
import { isStaleOrderError } from "@/utils/stale-order";

export const CACHE_TAGS = {
  ME: "Me",
  USER: "User",
  MENU: "Menu",
  CATEGORY: "Category",
  PRODUCT: "Product",
  ORDER: "Order",
  DASHBOARD: "Dashboard",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const LIST_ID: string = "LIST";

const ORDER_LIST_TAG: TagDescription<CacheTag> = { type: CACHE_TAGS.ORDER, id: LIST_ID };

export function orderWriteTags(id: string, error: unknown): TagDescription<CacheTag>[] {
  if (error === undefined) {
    return [ORDER_LIST_TAG, CACHE_TAGS.DASHBOARD];
  }
  return isStaleOrderError(error) ? [{ type: CACHE_TAGS.ORDER, id }, ORDER_LIST_TAG] : [];
}
