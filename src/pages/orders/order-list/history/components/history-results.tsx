import { useMemo, type JSX } from "react";
import type { StaffOrderSummary } from "@/@types/orders";
import { DataTable } from "@/components/data-table";
import type { DataTableColumns } from "@/components/data-table/features";
import { ResponsiveList } from "@/components/responsive-list";
import { MS_PER_MINUTE } from "@/constants/time";
import { useNow } from "@/hooks/use-now";
import { useOrderListPaths } from "../../hooks/use-order-list-paths";
import type { OrderListPaths } from "../../types";
import { buildHistoryColumns } from "../columns";
import { HISTORY_MESSAGES } from "../constants/messages";
import type { OrderHistoryModel } from "../types";
import { HistoryCardList } from "./history-card-list";
import { HistoryEmptyState, HistoryLoadError } from "./history-states";

interface HistoryResultsProps {
  history: OrderHistoryModel;
}

function orderIdOf(order: StaffOrderSummary): string {
  return order.id;
}

export function HistoryResults({ history }: HistoryResultsProps): JSX.Element {
  const paths: OrderListPaths = useOrderListPaths();
  const now: number = useNow(MS_PER_MINUTE);
  const columns: DataTableColumns<StaffOrderSummary> = useMemo(
    (): DataTableColumns<StaffOrderSummary> => buildHistoryColumns(paths, now),
    [paths, now],
  );

  if (history.loadError !== null) {
    return <HistoryLoadError detail={history.loadError} />;
  }

  const emptyState: JSX.Element = (
    <HistoryEmptyState
      hasFilters={history.hasFilters}
      onClearFilters={history.actions.clearFilters}
    />
  );

  return (
    <div aria-busy={history.refreshing} className="transition-opacity aria-busy:opacity-60">
      <ResponsiveList
        cards={
          <HistoryCardList
            orders={history.orders}
            loading={history.loading}
            emptyState={emptyState}
            paths={paths}
            now={now}
          />
        }
        table={
          <DataTable
            label={HISTORY_MESSAGES.LIST}
            columns={columns}
            data={history.orders}
            getRowId={orderIdOf}
            sort={history.filter.sort}
            onSortChange={history.actions.changeSort}
            loading={history.loading}
            emptyState={emptyState}
          />
        }
      />
    </div>
  );
}
