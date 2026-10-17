import { cn } from "cn";
import type { JSX } from "react";
import { ORDER_STATUS_TONES } from "@/components/order-status-badge/tones";
import { BOARD_COLUMN_LABELS } from "@/constants/orders";
import type { OrderListPaths } from "../../types";
import type { BoardColumn } from "../types";
import { BoardOrderList } from "./board-order-list";

interface BoardColumnsProps {
  columns: readonly BoardColumn[];
  paths: OrderListPaths;
  now: number;
}

export function BoardColumns({ columns, paths, now }: BoardColumnsProps): JSX.Element {
  return (
    <div className="grid grid-cols-3 items-start gap-4">
      {columns.map((column: BoardColumn): JSX.Element => (
        <section
          key={column.status}
          aria-label={BOARD_COLUMN_LABELS[column.status]}
          className="flex min-w-0 flex-col gap-2.5 rounded-2xl bg-border p-3"
        >
          <h2 className="flex items-center justify-between gap-2 px-1.5 py-1 font-sans text-[15px] font-bold">
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  ORDER_STATUS_TONES[column.status].dot,
                )}
              />
              {BOARD_COLUMN_LABELS[column.status]}
            </span>
            <span className="text-[13px]">{column.orders.length}</span>
          </h2>
          <BoardOrderList column={column} paths={paths} now={now} />
        </section>
      ))}
    </div>
  );
}
