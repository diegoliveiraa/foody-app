import type { JSX } from "react";
import type { MeScreen } from "@/@types/me";
import type { CustomerOrderSummary } from "@/@types/orders";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SCREEN_KEYS } from "@/constants/screens";
import { MS_PER_MINUTE } from "@/constants/time";
import { useMeScreen } from "@/hooks/use-me-screen";
import { useNow } from "@/hooks/use-now";
import { useScreenPath } from "@/hooks/use-screen-path";
import { MyOrderCard } from "./components/my-order-card";
import { MyOrdersEmpty, MyOrdersLoadError, MyOrdersSkeleton } from "./components/my-orders-states";
import { MY_ORDERS_MESSAGES } from "./constants/messages";
import { useMyOrders } from "./hooks/use-my-orders";
import type { MyOrdersModel } from "./types";

function MyOrdersBody({ list }: { list: MyOrdersModel }): JSX.Element {
  const now: number = useNow(MS_PER_MINUTE);
  const menuPath: string = useScreenPath(SCREEN_KEYS.STORE_MENU);

  if (list.loading) {
    return <MyOrdersSkeleton />;
  }
  if (list.loadError !== null) {
    return <MyOrdersLoadError detail={list.loadError} />;
  }
  if (list.orders.length === 0) {
    return <MyOrdersEmpty menuPath={menuPath} />;
  }
  return (
    <>
      <ul aria-label={MY_ORDERS_MESSAGES.LIST} className="flex flex-col gap-3">
        {list.orders.map((order: CustomerOrderSummary): JSX.Element => (
          <li key={order.id}>
            <MyOrderCard order={order} now={now} />
          </li>
        ))}
      </ul>
      {list.hasMore && (
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={list.loadingMore}
          onClick={list.loadMore}
          className="h-12 rounded-xl"
        >
          {list.loadingMore && <Spinner aria-hidden="true" />}
          {MY_ORDERS_MESSAGES.LOAD_MORE}
        </Button>
      )}
    </>
  );
}

export function MyOrdersScreen(): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.STORE_MY_ORDERS);
  const list: MyOrdersModel = useMyOrders();

  return (
    <>
      <PageHeader title={screen?.label} />
      <section className="flex flex-1 flex-col gap-3 px-4 pb-8 md:px-8">
        <MyOrdersBody list={list} />
      </section>
    </>
  );
}
