import type { OrderStatus } from "@/@types/orders";
import { ORDER_STATUSES } from "@/constants/orders";
import type { StatusTone } from "./types";

export const ORDER_STATUS_TONES: Record<OrderStatus, StatusTone> = {
  [ORDER_STATUSES.RECEIVED]: {
    badge: "bg-status-received text-status-received-foreground",
    dot: "bg-status-received-accent",
    ring: "ring-status-received",
    text: "text-status-received-foreground",
  },
  [ORDER_STATUSES.PREPARING]: {
    badge: "bg-status-preparing text-status-preparing-foreground",
    dot: "bg-status-preparing-accent",
    ring: "ring-status-preparing",
    text: "text-status-preparing-foreground",
  },
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: {
    badge: "bg-status-out-for-delivery text-status-out-for-delivery-foreground",
    dot: "bg-status-out-for-delivery-accent",
    ring: "ring-status-out-for-delivery",
    text: "text-status-out-for-delivery-foreground",
  },
  [ORDER_STATUSES.DELIVERED]: {
    badge: "bg-status-delivered text-status-delivered-foreground",
    dot: "bg-status-delivered-accent",
    ring: "ring-status-delivered",
    text: "text-status-delivered-foreground",
  },
  [ORDER_STATUSES.CANCELLED]: {
    badge: "bg-status-cancelled text-status-cancelled-foreground",
    dot: "bg-status-cancelled-accent",
    ring: "ring-status-cancelled",
    text: "text-status-cancelled-foreground",
  },
};
