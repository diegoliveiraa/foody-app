import type {
  Dashboard,
  DashboardBucket,
  DashboardCancellations,
  DashboardPendingRequests,
} from "@/@types/dashboard";
import { orderId } from "./orders";

export const RESTAURANT_TIME_ZONE: string = "America/Sao_Paulo";

const HOUR_MS: number = 3_600_000;

const DAY_MS: number = 24 * HOUR_MS;

const TODAY_START: number = Date.parse("2026-10-17T03:00:00Z");

const TODAY_HOURLY_COUNTS: readonly number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 6, 9, 4, 2, 1, 1, 3, 7,
];

const WEEK_DAILY_COUNTS: readonly number[] = [38, 41, 36, 44, 52, 58, 43];

function bucketsFrom(start: number, stepMs: number, counts: readonly number[]): DashboardBucket[] {
  return counts.map((count: number, index: number): DashboardBucket => ({
    bucketStart: new Date(start + index * stepMs).toISOString(),
    count,
  }));
}

export function hourlyBuckets(counts: readonly number[]): DashboardBucket[] {
  return bucketsFrom(TODAY_START, HOUR_MS, counts);
}

export function dailyBuckets(counts: readonly number[]): DashboardBucket[] {
  return bucketsFrom(TODAY_START - (counts.length - 1) * DAY_MS, DAY_MS, counts);
}

export const NO_CANCELLATIONS: DashboardCancellations = {
  count: 0,
  ratePercent: null,
  byReason: [],
};

export const NO_PENDING_REQUESTS: DashboardPendingRequests = { count: 0, items: [] };

export function dashboardResponse(changes: Partial<Dashboard> = {}): Dashboard {
  return {
    period: "TODAY",
    timeZone: RESTAURANT_TIME_ZONE,
    generatedAt: "2026-10-17T22:42:00Z",
    orders: { count: 48, previousCount: 43, changePercent: 12 },
    revenue: 2847.6,
    averageTicket: 59.32,
    ordersOverTime: { granularity: "HOUR", points: hourlyBuckets(TODAY_HOURLY_COUNTS) },
    topProducts: [
      {
        productId: "0199f2a0-0000-7000-8000-0000000000a1",
        name: "Smash duplo",
        quantity: 21,
        revenue: 732.9,
      },
      {
        productId: "0199f2a0-0000-7000-8000-0000000000a2",
        name: "Margherita",
        quantity: 9,
        revenue: 449.1,
      },
      {
        productId: "0199f2a0-0000-7000-8000-0000000000a3",
        name: "Limonada da casa",
        quantity: 26,
        revenue: 312,
      },
    ],
    activeByStatus: { received: 3, preparing: 2, outForDelivery: 1 },
    averageStageMinutes: {
      receivedToPreparing: 3,
      preparingToOutForDelivery: 18,
      outForDeliveryToDelivered: 22,
    },
    cancellations: {
      count: 2,
      ratePercent: 4.2,
      byReason: [
        { reason: "TAKING_TOO_LONG", cancelledBy: "CUSTOMER", count: 1 },
        { reason: "ITEM_UNAVAILABLE", cancelledBy: "RESTAURANT", count: 1 },
      ],
    },
    pendingCancellationRequests: {
      count: 2,
      items: [
        { orderId: orderId(1038), number: 1038, requestedAt: "2026-10-17T22:05:00Z" },
        { orderId: orderId(1041), number: 1041, requestedAt: "2026-10-17T22:20:00Z" },
      ],
    },
    ...changes,
  };
}

export function weekDashboard(changes: Partial<Dashboard> = {}): Dashboard {
  return dashboardResponse({
    period: "LAST_7_DAYS",
    orders: { count: 312, previousCount: 297, changePercent: 5.1 },
    ordersOverTime: { granularity: "DAY", points: dailyBuckets(WEEK_DAILY_COUNTS) },
    ...changes,
  });
}
