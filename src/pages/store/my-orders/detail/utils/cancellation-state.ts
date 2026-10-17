import type { CancellationRequestStatus, CustomerOrder } from "@/@types/orders";
import { CANCELLATION_REQUEST_STATUSES } from "@/constants/orders";
import { CANCELLATION_STATES } from "../constants";
import type { CancellationGrants, CancellationState } from "../types";

const REQUEST_STATES: Record<CancellationRequestStatus, CancellationState | null> = {
  [CANCELLATION_REQUEST_STATUSES.PENDING]: CANCELLATION_STATES.PENDING,
  [CANCELLATION_REQUEST_STATUSES.DECLINED]: CANCELLATION_STATES.DECLINED,
  [CANCELLATION_REQUEST_STATUSES.APPROVED]: null,
};

export function cancellationStateOf(
  order: CustomerOrder,
  grants: CancellationGrants,
): CancellationState | null {
  if (order.canCancel && grants.cancel) {
    return CANCELLATION_STATES.CANCEL;
  }
  if (order.canRequestCancellation && grants.request) {
    return CANCELLATION_STATES.REQUEST;
  }
  const status: CancellationRequestStatus | undefined = order.cancellationRequest?.status;
  return status === undefined ? null : REQUEST_STATES[status];
}
