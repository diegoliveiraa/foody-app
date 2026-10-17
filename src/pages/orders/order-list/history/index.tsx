import type { JSX } from "react";
import type { MeScreen } from "@/@types/me";
import { ListPagination } from "@/components/list-pagination";
import { PageHeader } from "@/components/page-header";
import { SCREEN_KEYS } from "@/constants/screens";
import { useMeScreen } from "@/hooks/use-me-screen";
import { OrderListTabs } from "../components/order-list-tabs";
import { HistoryResults } from "./components/history-results";
import { HistoryToolbar } from "./components/history-toolbar";
import { useOrderHistory } from "./hooks/use-order-history";
import type { OrderHistoryModel } from "./types";

export function OrderHistoryScreen(): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.ORDERS_ORDER_LIST);
  const history: OrderHistoryModel = useOrderHistory();

  return (
    <>
      <PageHeader title={screen?.label} />
      <section className="flex flex-1 flex-col gap-4 px-4 pb-8 md:px-8">
        <OrderListTabs />
        <HistoryToolbar filter={history.filter} actions={history.actions} />
        <HistoryResults history={history} />
        {history.pagination && (
          <ListPagination
            meta={history.pagination}
            onPageChange={history.actions.changePage}
            onPageSizeChange={history.actions.changePageSize}
          />
        )}
      </section>
    </>
  );
}
