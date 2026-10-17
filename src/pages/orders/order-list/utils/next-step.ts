import type { OrderStatus } from "@/@types/orders";
import type { AdvanceStatus } from "@/constants/orders";
import { ADVANCE_LABELS, ADVANCED_MESSAGES } from "../constants/messages";
import type { NextStep } from "../types";

function isAdvance(status: OrderStatus | undefined): status is AdvanceStatus {
  return status !== undefined && Object.hasOwn(ADVANCE_LABELS, status);
}

export function toNextStep(allowedTransitions: readonly OrderStatus[]): NextStep | null {
  const [target] = allowedTransitions;
  if (!isAdvance(target)) {
    return null;
  }
  return { status: target, label: ADVANCE_LABELS[target], done: ADVANCED_MESSAGES[target] };
}
