import type {
  CancellationReason,
  StaffCancellationRequest,
  StaffOrderHistoryEntry,
} from "@/@types/orders";
import { ORDER_STATUS_TONES } from "@/components/order-status-badge/tones";
import {
  ACTOR_SIDE_LABELS,
  ACTOR_SIDES,
  CANCELLATION_REASON_LABELS,
  CANCELLATION_REQUEST_STATUSES,
  ORDER_STATUS_LABELS,
} from "@/constants/orders";
import { formatClock } from "@/utils/format-order-date";
import { REQUEST_DOT, REQUEST_ENTRY_KEYS } from "../constants";
import { ORDER_DETAIL_MESSAGES, REQUEST_DECIDED_TITLES } from "../constants/messages";
import type { HistoryEntryView, HistorySource } from "../types";

interface TimedEntry {
  at: string;
  view: HistoryEntryView;
}

function titleOf({ fromStatus, toStatus }: StaffOrderHistoryEntry): string {
  if (fromStatus === null || fromStatus === undefined) {
    return ORDER_DETAIL_MESSAGES.CREATED;
  }
  return ORDER_DETAIL_MESSAGES.STATUS_CHANGE(
    ORDER_STATUS_LABELS[fromStatus],
    ORDER_STATUS_LABELS[toStatus],
  );
}

function reasonOf(reason: CancellationReason | null | undefined): string | null {
  if (reason === null || reason === undefined) {
    return null;
  }
  return ORDER_DETAIL_MESSAGES.REASON(CANCELLATION_REASON_LABELS[reason]);
}

function statusEntry(entry: StaffOrderHistoryEntry): TimedEntry {
  return {
    at: entry.occurredAt,
    view: {
      key: `${entry.occurredAt}${entry.toStatus}`,
      dot: ORDER_STATUS_TONES[entry.toStatus].dot,
      title: titleOf(entry),
      detail: ORDER_DETAIL_MESSAGES.ACTOR(
        formatClock(entry.occurredAt),
        entry.actorName,
        ACTOR_SIDE_LABELS[entry.actorSide],
      ),
      reason: reasonOf(entry.reason),
      note: entry.note ?? null,
    },
  };
}

function requestedEntry(request: StaffCancellationRequest, customerName: string): TimedEntry {
  return {
    at: request.requestedAt,
    view: {
      key: REQUEST_ENTRY_KEYS.REQUESTED,
      dot: REQUEST_DOT,
      title: ORDER_DETAIL_MESSAGES.REQUEST_CREATED,
      detail: ORDER_DETAIL_MESSAGES.ACTOR(
        formatClock(request.requestedAt),
        customerName,
        ACTOR_SIDE_LABELS[ACTOR_SIDES.CUSTOMER],
      ),
      reason: reasonOf(request.reason),
      note: request.note ?? null,
    },
  };
}

function decidedEntries(request: StaffCancellationRequest): TimedEntry[] {
  const { status, decidedAt, decidedByName } = request;
  if (status === CANCELLATION_REQUEST_STATUSES.PENDING || !decidedAt || !decidedByName) {
    return [];
  }
  return [
    {
      at: decidedAt,
      view: {
        key: REQUEST_ENTRY_KEYS.DECIDED,
        dot: REQUEST_DOT,
        title: REQUEST_DECIDED_TITLES[status],
        detail: ORDER_DETAIL_MESSAGES.ACTOR(
          formatClock(decidedAt),
          decidedByName,
          ACTOR_SIDE_LABELS[ACTOR_SIDES.RESTAURANT],
        ),
        reason: null,
        note: request.decisionNote ?? null,
      },
    },
  ];
}

function requestEntries(
  request: StaffCancellationRequest | null | undefined,
  customerName: string,
): TimedEntry[] {
  if (request === null || request === undefined) {
    return [];
  }
  return [requestedEntry(request, customerName), ...decidedEntries(request)];
}

function newestFirst(first: TimedEntry, second: TimedEntry): number {
  return Date.parse(second.at) - Date.parse(first.at);
}

export function toHistoryEntries({
  history,
  cancellationRequest,
  customer,
}: HistorySource): HistoryEntryView[] {
  return [...history.map(statusEntry), ...requestEntries(cancellationRequest, customer.name)]
    .sort(newestFirst)
    .map(({ view }: TimedEntry): HistoryEntryView => view);
}
