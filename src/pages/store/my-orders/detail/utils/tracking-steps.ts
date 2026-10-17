import type { CustomerOrder, CustomerOrderHistoryEntry, OrderStatus } from "@/@types/orders";
import { TRACKING_STEPS } from "@/constants/orders";
import { STEP_STATES } from "../constants";
import type { StepState, TrackingStep } from "../types";

function reachedAtOf(
  history: readonly CustomerOrderHistoryEntry[],
  status: OrderStatus,
): string | null {
  return (
    history.findLast((entry: CustomerOrderHistoryEntry): boolean => entry.toStatus === status)
      ?.occurredAt ?? null
  );
}

function stateOf(index: number, currentIndex: number): StepState {
  if (index < currentIndex) {
    return STEP_STATES.DONE;
  }
  return index === currentIndex ? STEP_STATES.CURRENT : STEP_STATES.PENDING;
}

export function toTrackingSteps(order: Pick<CustomerOrder, "status" | "history">): TrackingStep[] {
  const currentIndex: number = TRACKING_STEPS.indexOf(order.status);
  return TRACKING_STEPS.map((status: OrderStatus, index: number): TrackingStep => ({
    status,
    state: stateOf(index, currentIndex),
    reachedAt: reachedAtOf(order.history, status),
  }));
}
