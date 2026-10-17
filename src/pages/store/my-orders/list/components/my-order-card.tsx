import type { JSX } from "react";
import { Link } from "react-router";
import type { CustomerOrderSummary } from "@/@types/orders";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { MESSAGES } from "@/constants/messages";
import { formatMoney } from "@/utils/format-money";
import { formatOrderTime } from "@/utils/format-order-date";
import { summarizeItems } from "@/utils/order-items";

interface MyOrderCardProps {
  order: CustomerOrderSummary;
  now: number;
}

export function MyOrderCard({ order, now }: MyOrderCardProps): JSX.Element {
  return (
    <Link
      to={order.id}
      className="flex flex-col gap-2.5 rounded-2xl border bg-card p-4 text-foreground shadow-xs transition-colors outline-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-base font-bold">{MESSAGES.ORDERS.TITLE(order.number)}</span>
        <OrderStatusBadge status={order.status} />
      </span>
      <span className="text-sm break-words text-muted-foreground">
        {summarizeItems(order.items)}
      </span>
      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted-foreground">
          {formatOrderTime(order.placedAt, now)}
        </span>
        <span className="text-[15px] font-bold">{formatMoney(order.total)}</span>
      </span>
    </Link>
  );
}
