import type { CancellationRequestStatus } from "@/@types/orders";
import { CANCELLATION_REQUEST_STATUSES } from "@/constants/orders";

const SHOWN_ONCE_OVER: Record<CancellationRequestStatus, boolean> = {
  [CANCELLATION_REQUEST_STATUSES.PENDING]: true,
  [CANCELLATION_REQUEST_STATUSES.APPROVED]: true,
  [CANCELLATION_REQUEST_STATUSES.DECLINED]: false,
};

export function requestStatusToShow(
  status: CancellationRequestStatus | null | undefined,
  live: boolean,
): CancellationRequestStatus | null {
  if (status === null || status === undefined) {
    return null;
  }
  return live || SHOWN_ONCE_OVER[status] ? status : null;
}
