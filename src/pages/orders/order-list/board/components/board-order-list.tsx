import type { JSX } from "react";
import type { StaffOrderSummary } from "@/@types/orders";
import { BOARD_COLUMN_LABELS } from "@/constants/orders";
import type { OrderListPaths } from "../../types";
import { BOARD_MESSAGES, EMPTY_COLUMN_MESSAGES } from "../constants/messages";
import type { BoardColumn } from "../types";
import { BoardOrderCard } from "./board-order-card";

interface BoardOrderListProps {
  column: BoardColumn;
  paths: OrderListPaths;
  now: number;
}

export function BoardOrderList({ column, paths, now }: BoardOrderListProps): JSX.Element {
  if (column.orders.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-input px-4 py-6 text-center text-sm text-muted-foreground">
        {EMPTY_COLUMN_MESSAGES[column.status]}
      </p>
    );
  }
  return (
    <ul
      aria-label={BOARD_MESSAGES.ORDERS_IN(BOARD_COLUMN_LABELS[column.status])}
      className="flex flex-col gap-2.5"
    >
      {column.orders.map((order: StaffOrderSummary): JSX.Element => (
        <li key={order.id}>
          <BoardOrderCard
            order={order}
            detailPath={paths.detail(order.id)}
            now={now}
            showsCancel={column.showsCancel}
          />
        </li>
      ))}
    </ul>
  );
}
