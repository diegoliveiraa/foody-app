import type { StaffOrderSummary } from "@/@types/orders";
import type { PendingRequests } from "../types";

function olderOf(oldest: StaffOrderSummary, order: StaffOrderSummary): StaffOrderSummary {
  return Date.parse(order.placedAt) < Date.parse(oldest.placedAt) ? order : oldest;
}

export function pendingRequestsOf(orders: readonly StaffOrderSummary[]): PendingRequests | null {
  const pending: StaffOrderSummary[] = orders.filter(
    (order: StaffOrderSummary): boolean => order.hasPendingCancellationRequest,
  );
  const [first, ...others] = pending;
  if (first === undefined) {
    return null;
  }
  return { count: pending.length, oldest: others.reduce(olderOf, first) };
}
