import type { JSX } from "react";
import { Link } from "react-router";
import type { StaffOrderSummary } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";
import { formatMoney } from "@/utils/format-money";
import { formatOrderAge } from "@/utils/format-order-date";
import { summarizeItems } from "@/utils/order-items";

interface BoardOrderCardProps {
  order: StaffOrderSummary;
  detailPath: string;
  now: number;
}

export function BoardOrderCard({ order, detailPath, now }: BoardOrderCardProps): JSX.Element {
  return (
    <article
      aria-label={MESSAGES.ORDERS.TITLE(order.number)}
      className="relative flex flex-col gap-1.5 rounded-2xl border bg-card p-4 transition-colors has-[a:hover]:bg-muted/40"
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          to={detailPath}
          className="text-[17px] font-bold outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
        >
          {MESSAGES.ORDERS.NUMBER(order.number)}
        </Link>
        <span className="shrink-0 text-[13px] text-muted-foreground">
          {formatOrderAge(order.placedAt, now)}
        </span>
      </div>
      <span className="text-sm font-semibold break-words">{order.customerName}</span>
      <span className="text-sm break-words text-muted-foreground">
        {summarizeItems(order.items)}
      </span>
      <span className="mt-1 text-base font-bold">{formatMoney(order.total)}</span>
    </article>
  );
}
