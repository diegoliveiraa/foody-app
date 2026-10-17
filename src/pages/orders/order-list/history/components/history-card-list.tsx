import type { JSX, ReactNode } from "react";
import { Link } from "react-router";
import type { StaffOrderSummary } from "@/@types/orders";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MESSAGES } from "@/constants/messages";
import { formatMoney } from "@/utils/format-money";
import { formatOrderTime } from "@/utils/format-order-date";
import { summarizeItems } from "@/utils/order-items";
import type { OrderListPaths } from "../../types";
import { SKELETON_CARDS } from "../constants";
import { HISTORY_MESSAGES } from "../constants/messages";

interface HistoryCardProps {
  order: StaffOrderSummary;
  detailPath: string;
  now: number;
}

interface HistoryCardListProps {
  orders: readonly StaffOrderSummary[];
  loading: boolean;
  emptyState: ReactNode;
  paths: OrderListPaths;
  now: number;
}

function HistoryCard({ order, detailPath, now }: HistoryCardProps): JSX.Element {
  return (
    <article
      aria-label={MESSAGES.ORDERS.TITLE(order.number)}
      className="relative flex flex-col gap-2 rounded-2xl border bg-card p-4 shadow-xs transition-colors has-[a:hover]:bg-muted/40"
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          to={detailPath}
          className="font-bold outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
        >
          {MESSAGES.ORDERS.NUMBER(order.number)}
        </Link>
        <OrderStatusBadge status={order.status} />
      </div>
      <span className="text-sm font-semibold break-words">{order.customerName}</span>
      <span className="text-sm break-words text-muted-foreground">
        {summarizeItems(order.items)}
      </span>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted-foreground">
          {formatOrderTime(order.placedAt, now)}
        </span>
        <span className="font-bold">{formatMoney(order.total)}</span>
      </div>
    </article>
  );
}

function SkeletonCards(): JSX.Element {
  return (
    <div aria-busy="true" aria-label={HISTORY_MESSAGES.LIST} className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_CARDS }, (_card: unknown, index: number): JSX.Element => (
        <div key={index} className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

export function HistoryCardList({
  orders,
  loading,
  emptyState,
  paths,
  now,
}: HistoryCardListProps): JSX.Element {
  if (loading) {
    return <SkeletonCards />;
  }
  if (orders.length === 0) {
    return <>{emptyState}</>;
  }
  return (
    <ul aria-label={HISTORY_MESSAGES.LIST} className="flex flex-col gap-3">
      {orders.map((order: StaffOrderSummary): JSX.Element => (
        <li key={order.id}>
          <HistoryCard order={order} detailPath={paths.detail(order.id)} now={now} />
        </li>
      ))}
    </ul>
  );
}
