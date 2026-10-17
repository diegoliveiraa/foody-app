import { Bike, Check, ChefHat, CircleX, MapPin, Receipt, type LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/@types/orders";
import { ORDER_STATUSES } from "@/constants/orders";

export const STEP_STATES = {
  DONE: "done",
  CURRENT: "current",
  PENDING: "pending",
} as const;

export const STEP_ICONS: Record<OrderStatus, LucideIcon> = {
  [ORDER_STATUSES.RECEIVED]: Receipt,
  [ORDER_STATUSES.PREPARING]: ChefHat,
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: Bike,
  [ORDER_STATUSES.DELIVERED]: MapPin,
  [ORDER_STATUSES.CANCELLED]: CircleX,
};

export const DONE_ICON: LucideIcon = Check;

export const SHEET_MODES = {
  CANCEL: "cancel",
  REQUEST: "request",
} as const;

export const CANCELLATION_STATES = {
  ...SHEET_MODES,
  PENDING: "pending",
  DECLINED: "declined",
} as const;
