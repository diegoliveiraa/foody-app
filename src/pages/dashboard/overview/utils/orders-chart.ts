import type {
  Dashboard,
  DashboardBucket,
  DashboardGranularity,
  DashboardPeriod,
} from "@/@types/dashboard";
import {
  formatZonedDayMonth,
  formatZonedHour,
  formatZonedWeekday,
} from "@/utils/format-zoned-date";
import {
  AXIS_TICKS,
  DASHBOARD_GRANULARITIES,
  DASHBOARD_PERIODS,
  NOT_FOUND_INDEX,
  NOTHING_COUNTED,
} from "../constants";
import {
  BUCKET_HEADERS,
  CHART_TITLES,
  DASHBOARD_MESSAGES,
  PERIOD_LABELS,
} from "../constants/messages";
import type { ChartPoint, OrdersChart } from "../types";

type BucketLabel = (instant: string, timeZone: string) => string;

type SeriesStart = (buckets: readonly DashboardBucket[]) => DashboardBucket[];

function dayLabel(instant: string, timeZone: string): string {
  return DASHBOARD_MESSAGES.WEEKDAY_DATE(
    formatZonedWeekday(instant, timeZone),
    formatZonedDayMonth(instant, timeZone),
  );
}

function fromFirstOrder(buckets: readonly DashboardBucket[]): DashboardBucket[] {
  const first: number = buckets.findIndex(
    (bucket: DashboardBucket): boolean => bucket.count > NOTHING_COUNTED,
  );
  return first === NOT_FOUND_INDEX ? [...buckets] : buckets.slice(first);
}

function wholeSeries(buckets: readonly DashboardBucket[]): DashboardBucket[] {
  return [...buckets];
}

const AXIS_LABELS: Record<DashboardPeriod, BucketLabel> = {
  [DASHBOARD_PERIODS.TODAY]: formatZonedHour,
  [DASHBOARD_PERIODS.LAST_7_DAYS]: formatZonedWeekday,
  [DASHBOARD_PERIODS.LAST_30_DAYS]: formatZonedDayMonth,
};

const FULL_LABELS: Record<DashboardGranularity, BucketLabel> = {
  [DASHBOARD_GRANULARITIES.HOUR]: formatZonedHour,
  [DASHBOARD_GRANULARITIES.DAY]: dayLabel,
};

const SERIES_STARTS: Record<DashboardPeriod, SeriesStart> = {
  [DASHBOARD_PERIODS.TODAY]: fromFirstOrder,
  [DASHBOARD_PERIODS.LAST_7_DAYS]: wholeSeries,
  [DASHBOARD_PERIODS.LAST_30_DAYS]: wholeSeries,
};

function tickIndexes(length: number, ticks: number): number[] {
  if (length <= ticks) {
    return Array.from({ length }, (_item: unknown, index: number): number => index);
  }
  const last: number = length - 1;
  const steps: number = ticks - 1;
  return Array.from({ length: ticks }, (_item: unknown, tick: number): number =>
    Math.round((tick * last) / steps),
  );
}

export function toOrdersChart({ period, timeZone, ordersOverTime }: Dashboard): OrdersChart {
  const granularity: DashboardGranularity = ordersOverTime.granularity;
  const title: string = CHART_TITLES[granularity];
  const points: ChartPoint[] = SERIES_STARTS[period](ordersOverTime.points).map(
    (bucket: DashboardBucket): ChartPoint => ({
      key: bucket.bucketStart,
      label: AXIS_LABELS[period](bucket.bucketStart, timeZone),
      fullLabel: FULL_LABELS[granularity](bucket.bucketStart, timeZone),
      count: bucket.count,
    }),
  );

  return {
    title,
    label: DASHBOARD_MESSAGES.CHART_LABEL(title, PERIOD_LABELS[period]),
    bucketHeader: BUCKET_HEADERS[granularity],
    points,
    ticks: tickIndexes(points.length, AXIS_TICKS[granularity]).map(
      (index: number): string => points[index].label,
    ),
  };
}
