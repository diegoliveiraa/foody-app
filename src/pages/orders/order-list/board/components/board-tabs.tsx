import type { JSX } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BOARD_TAB_LABELS, ORDER_STATUSES } from "@/constants/orders";
import type { OrderListPaths } from "../../types";
import { BOARD_MESSAGES } from "../constants/messages";
import type { BoardColumn } from "../types";
import { BoardOrderList } from "./board-order-list";

interface BoardTabsProps {
  columns: readonly BoardColumn[];
  paths: OrderListPaths;
  now: number;
}

export function BoardTabs({ columns, paths, now }: BoardTabsProps): JSX.Element {
  return (
    <Tabs defaultValue={ORDER_STATUSES.RECEIVED} className="gap-3">
      <TabsList
        variant="line"
        aria-label={BOARD_MESSAGES.BY_STATUS}
        className="grid h-auto min-h-12 w-full grid-cols-3 border-b"
      >
        {columns.map((column: BoardColumn): JSX.Element => (
          <TabsTrigger
            key={column.status}
            value={column.status}
            className="group/trigger h-auto min-h-12 flex-wrap gap-x-1.5 gap-y-0.5 px-1 py-1 leading-tight whitespace-normal"
          >
            {BOARD_TAB_LABELS[column.status]}
            <span className="inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-border px-1.5 text-xs font-bold text-foreground group-data-active/trigger:bg-primary group-data-active/trigger:text-primary-foreground">
              {column.orders.length}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {columns.map((column: BoardColumn): JSX.Element => (
        <TabsContent key={column.status} value={column.status}>
          <BoardOrderList column={column} paths={paths} now={now} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
