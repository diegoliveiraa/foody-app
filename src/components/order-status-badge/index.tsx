import { cn } from "cn";
import type { JSX } from "react";
import type { OrderStatus } from "@/@types/orders";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/constants/orders";
import { ORDER_STATUS_TONES } from "./tones";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps): JSX.Element {
  return (
    <Badge className={cn("h-6.5 px-2.5", ORDER_STATUS_TONES[status].badge, className)}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
