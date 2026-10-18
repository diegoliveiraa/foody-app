import type { CancellationRequestStatus, CustomerOrder } from "@/@types/orders";
import { CANCELLATION_REQUEST_STATUSES } from "@/constants/orders";
import { requestStatusToShow } from "@/utils/cancellation-request";
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
  const status: CancellationRequestStatus | null = requestStatusToShow(
    order.cancellationRequest?.status,
    order.live,
  );
  return status === null ? null : REQUEST_STATES[status];
}
