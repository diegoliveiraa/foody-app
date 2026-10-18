import { createColumnHelper, type CellContext, type ColumnHelper } from "@tanstack/react-table";
import type { JSX } from "react";
import { Link } from "react-router";
import type { OrderItemSummary, OrderStatus, StaffOrderSummary } from "@/@types/orders";
import type { DataTableColumns, DataTableFeatures } from "@/components/data-table/features";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { MESSAGES } from "@/constants/messages";
import type { OrderListPaths } from "@/routes/types";
import { formatMoney } from "@/utils/format-money";
import { formatOrderTime } from "@/utils/format-order-date";
import { summarizeItems } from "@/utils/order-items";
import { HISTORY_COLUMNS } from "./constants";
import { HISTORY_MESSAGES } from "./constants/messages";

type OrderCell<TValue> = CellContext<DataTableFeatures, StaffOrderSummary, TValue>;

const column: ColumnHelper<DataTableFeatures, StaffOrderSummary> = createColumnHelper<
  DataTableFeatures,
  StaffOrderSummary
>();

export function buildHistoryColumns(
  paths: OrderListPaths,
  now: number,
): DataTableColumns<StaffOrderSummary> {
  return column.columns([
    column.accessor(HISTORY_COLUMNS.NUMBER, {
      header: HISTORY_MESSAGES.COLUMNS.NUMBER,
      cell: ({ row, getValue }: OrderCell<number>): JSX.Element => (
        <Link
          to={paths.detail(row.original.id)}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {MESSAGES.ORDERS.NUMBER(getValue())}
        </Link>
      ),
    }),
    column.accessor(HISTORY_COLUMNS.CUSTOMER, {
      header: HISTORY_MESSAGES.COLUMNS.CUSTOMER,
      enableSorting: false,
      cell: ({ getValue }: OrderCell<string>): JSX.Element => (
        <span className="whitespace-normal text-foreground">{getValue()}</span>
      ),
    }),
    column.accessor(HISTORY_COLUMNS.ITEMS, {
      header: HISTORY_MESSAGES.COLUMNS.ITEMS,
      enableSorting: false,
      cell: ({ getValue }: OrderCell<OrderItemSummary[]>): JSX.Element => (
        <span className="block max-w-64 whitespace-normal text-muted-foreground">
          {summarizeItems(getValue())}
        </span>
      ),
    }),
    column.accessor(HISTORY_COLUMNS.TOTAL, {
      header: HISTORY_MESSAGES.COLUMNS.TOTAL,
      cell: ({ getValue }: OrderCell<number>): string => formatMoney(getValue()),
    }),
    column.accessor(HISTORY_COLUMNS.STATUS, {
      header: HISTORY_MESSAGES.COLUMNS.STATUS,
      enableSorting: false,
      cell: ({ getValue }: OrderCell<OrderStatus>): JSX.Element => (
        <OrderStatusBadge status={getValue()} />
      ),
    }),
    column.accessor(HISTORY_COLUMNS.PLACED_AT, {
      header: HISTORY_MESSAGES.COLUMNS.PLACED_AT,
      cell: ({ getValue }: OrderCell<string>): string => formatOrderTime(getValue(), now),
    }),
  ]);
}
