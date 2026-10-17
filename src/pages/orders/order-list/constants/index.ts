import type { TagDescription } from "@reduxjs/toolkit/query";
import { CACHE_TAGS, LIST_ID, type CacheTag } from "@/services/cache-tags";

export const HISTORY_SEGMENT: string = "history";

export const ORDER_LIST_TAGS: readonly TagDescription<CacheTag>[] = [
  { type: CACHE_TAGS.ORDER, id: LIST_ID },
];
