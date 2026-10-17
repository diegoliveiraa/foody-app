import type { StaffOrderSummary } from "@/@types/orders";
import { ORDER_STATUSES, type BoardStatus } from "@/constants/orders";

export const NO_ORDERS: readonly StaffOrderSummary[] = [];

export const CARD_OFFERS_CANCEL: Record<BoardStatus, boolean> = {
  [ORDER_STATUSES.RECEIVED]: true,
  [ORDER_STATUSES.PREPARING]: true,
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: false,
};

export const SKELETON_COLUMNS: number = 3;

export const SKELETON_CARDS: number = 2;
