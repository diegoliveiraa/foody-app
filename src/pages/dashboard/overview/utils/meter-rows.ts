import type {
  DashboardCancellationCount,
  DashboardCancellations,
  DashboardStageMinutes,
} from "@/@types/dashboard";
import { ACTOR_SIDE_LABELS, CANCELLATION_REASON_LABELS } from "@/constants/orders";
import { formatCount, formatMinutes, formatPercent } from "@/utils/format-number";
import {
  EMPTY_BAR_PERCENT,
  FULL_BAR_PERCENT,
  NOTHING_COUNTED,
  ROW_KEY_SEPARATOR,
  STAGE_KEYS,
} from "../constants";
import { DASHBOARD_MESSAGES, STAGE_LABELS } from "../constants/messages";
import type { CancellationsView, MeterRow, StageKey } from "../types";
import { isKnown, orDash } from "./or-dash";

function largestOf(values: readonly number[]): number {
  return Math.max(NOTHING_COUNTED, ...values);
}

function widthPercent(value: number, largest: number): number {
  if (largest <= NOTHING_COUNTED) {
    return EMPTY_BAR_PERCENT;
  }
  return Math.round((value / largest) * FULL_BAR_PERCENT);
}

export function toStageRows(minutes: DashboardStageMinutes): MeterRow[] {
  const largest: number = largestOf(
    STAGE_KEYS.map((key: StageKey): number => minutes[key] ?? NOTHING_COUNTED),
  );
  return STAGE_KEYS.map((key: StageKey): MeterRow => ({
    key,
    label: STAGE_LABELS[key],
    value: orDash(minutes[key], formatMinutes),
    widthPercent: widthPercent(minutes[key] ?? NOTHING_COUNTED, largest),
  }));
}

export function toCancellationsView({
  ratePercent,
  byReason,
}: DashboardCancellations): CancellationsView {
  const largest: number = largestOf(
    byReason.map((row: DashboardCancellationCount): number => row.count),
  );
  return {
    rate: isKnown(ratePercent)
      ? DASHBOARD_MESSAGES.CANCELLATION_RATE(formatPercent(ratePercent))
      : null,
    rows: byReason.map((row: DashboardCancellationCount): MeterRow => ({
      key: `${row.reason}${ROW_KEY_SEPARATOR}${row.cancelledBy}`,
      label: DASHBOARD_MESSAGES.CANCELLATION_REASON(
        CANCELLATION_REASON_LABELS[row.reason],
        ACTOR_SIDE_LABELS[row.cancelledBy],
      ),
      value: formatCount(row.count),
      widthPercent: widthPercent(row.count, largest),
    })),
  };
}
