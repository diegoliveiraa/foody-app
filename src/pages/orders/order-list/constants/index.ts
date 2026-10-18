import type { TagDescription } from "@reduxjs/toolkit/query";
import { Bike, ChefHat, CircleCheck, type LucideIcon } from "lucide-react";
import { ORDER_STATUSES, type AdvanceStatus } from "@/constants/orders";
import { CACHE_TAGS, LIST_ID, type CacheTag } from "@/services/cache-tags";

export const ORDER_LIST_TAGS: readonly TagDescription<CacheTag>[] = [
  { type: CACHE_TAGS.ORDER, id: LIST_ID },
];

export const ADVANCE_ICONS: Record<AdvanceStatus, LucideIcon> = {
  [ORDER_STATUSES.PREPARING]: ChefHat,
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: Bike,
  [ORDER_STATUSES.DELIVERED]: CircleCheck,
};
