import type { StaffOrderHistoryEntry } from "@/@types/orders";
import {
  ACTOR_SIDE_LABELS,
  CANCELLATION_REASON_LABELS,
  ORDER_STATUS_LABELS,
} from "@/constants/orders";
import { formatClock } from "@/utils/format-order-date";
import { ORDER_DETAIL_MESSAGES } from "../constants/messages";
import type { HistoryEntryView } from "../types";

function titleOf({ fromStatus, toStatus }: StaffOrderHistoryEntry): string {
  if (fromStatus === null || fromStatus === undefined) {
    return ORDER_DETAIL_MESSAGES.CREATED;
  }
  return ORDER_DETAIL_MESSAGES.STATUS_CHANGE(
    ORDER_STATUS_LABELS[fromStatus],
    ORDER_STATUS_LABELS[toStatus],
  );
}

function reasonOf({ reason }: StaffOrderHistoryEntry): string | null {
  if (reason === null || reason === undefined) {
    return null;
  }
  return ORDER_DETAIL_MESSAGES.REASON(CANCELLATION_REASON_LABELS[reason]);
}

function newestFirst(first: StaffOrderHistoryEntry, second: StaffOrderHistoryEntry): number {
  return Date.parse(second.occurredAt) - Date.parse(first.occurredAt);
}

export function toHistoryEntries(history: readonly StaffOrderHistoryEntry[]): HistoryEntryView[] {
  return [...history].sort(newestFirst).map((entry: StaffOrderHistoryEntry): HistoryEntryView => ({
    key: `${entry.occurredAt}${entry.toStatus}`,
    status: entry.toStatus,
    title: titleOf(entry),
    detail: ORDER_DETAIL_MESSAGES.ACTOR(
      formatClock(entry.occurredAt),
      entry.actorName,
      ACTOR_SIDE_LABELS[entry.actorSide],
    ),
    reason: reasonOf(entry),
    note: entry.note ?? null,
  }));
}
