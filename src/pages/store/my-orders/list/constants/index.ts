import { CircleCheck, CircleX, Clock, type LucideIcon } from "lucide-react";
import type { CancellationRequestStatus, CustomerOrderSummary } from "@/@types/orders";
import { CANCELLATION_REQUEST_STATUSES } from "@/constants/orders";

export const NO_ORDERS: readonly CustomerOrderSummary[] = [];

export const SKELETON_CARDS: number = 3;

export const REQUEST_NOTE_ICONS: Record<CancellationRequestStatus, LucideIcon> = {
  [CANCELLATION_REQUEST_STATUSES.PENDING]: Clock,
  [CANCELLATION_REQUEST_STATUSES.DECLINED]: CircleX,
  [CANCELLATION_REQUEST_STATUSES.APPROVED]: CircleCheck,
};
