import type { TagDescription } from "@reduxjs/toolkit/query";
import type {
  DashboardActiveOrders,
  DashboardGranularity,
  DashboardPeriod,
} from "@/@types/dashboard";
import { ORDER_STATUSES, type BoardStatus } from "@/constants/orders";
import { CACHE_TAGS, type CacheTag } from "@/services/cache-tags";
import type { StageKey } from "../types";

export const DASHBOARD_PERIODS = {
  TODAY: "TODAY",
  LAST_7_DAYS: "LAST_7_DAYS",
  LAST_30_DAYS: "LAST_30_DAYS",
} as const satisfies Record<DashboardPeriod, DashboardPeriod>;

export const DASHBOARD_PERIOD_LIST: readonly DashboardPeriod[] = Object.values(DASHBOARD_PERIODS);

export const DEFAULT_PERIOD: DashboardPeriod = DASHBOARD_PERIODS.TODAY;

export const PERIOD_PARAM: string = "period";

export const DASHBOARD_GRANULARITIES = {
  HOUR: "HOUR",
  DAY: "DAY",
} as const satisfies Record<DashboardGranularity, DashboardGranularity>;

export const DASHBOARD_TAGS: readonly TagDescription<CacheTag>[] = [CACHE_TAGS.DASHBOARD];

export const STAGE_KEYS: readonly StageKey[] = [
  "receivedToPreparing",
  "preparingToOutForDelivery",
  "outForDeliveryToDelivered",
];

export const AXIS_TICKS: Record<DashboardGranularity, number> = {
  [DASHBOARD_GRANULARITIES.HOUR]: 4,
  [DASHBOARD_GRANULARITIES.DAY]: 3,
};

export const ACTIVE_COUNT_FIELDS: Record<BoardStatus, keyof DashboardActiveOrders> = {
  [ORDER_STATUSES.RECEIVED]: "received",
  [ORDER_STATUSES.PREPARING]: "preparing",
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: "outForDelivery",
};

export const FULL_BAR_PERCENT: number = 100;

export const EMPTY_BAR_PERCENT: number = 0;

export const NOTHING_COUNTED: number = 0;

export const FIRST_RANK: number = 1;

export const NOT_FOUND_INDEX: number = -1;

export const ROW_KEY_SEPARATOR: string = "-";

export const DETAIL_TONES = {
  UP: "UP",
  DOWN: "DOWN",
  NEUTRAL: "NEUTRAL",
  MUTED: "MUTED",
} as const;

export const SKELETON_KPIS: number = 4;

export const SKELETON_SECTIONS: number = 2;
