import type { JSX } from "react";
import { Link } from "react-router";
import type { MeScreen } from "@/@types/me";
import type { CustomerOrder } from "@/@types/orders";
import { BackLink } from "@/components/back-link";
import { DeliveryAddress } from "@/components/delivery-address";
import { OrderCancellation } from "@/components/order-cancellation";
import { OrderItemsCard } from "@/components/order-items-card";
import { OrderDetailSkeleton, OrderLoadError, OrderNotFound } from "@/components/order-states";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { PARENT_PATH } from "@/constants/routes";
import { SCREEN_KEYS } from "@/constants/screens";
import { useMeScreen } from "@/hooks/use-me-screen";
import { CancellationBlock } from "./components/cancellation-block";
import { CancellationSheet } from "./components/cancellation-sheet";
import { OrderStatusCard } from "./components/order-status-card";
import { TRACKING_MESSAGES } from "./constants/messages";
import { useCancellation } from "./hooks/use-cancellation";
import { useMyOrder } from "./hooks/use-my-order";
import type { CancellationModel, MyOrderModel } from "./types";

function OrderTracking({ order }: { order: CustomerOrder }): JSX.Element {
  const cancellation: CancellationModel = useCancellation(order);

  return (
    <>
      <OrderStatusCard order={order} />
      <CancellationBlock order={order} model={cancellation} />
      {order.cancellation && <OrderCancellation cancellation={order.cancellation} />}
      <OrderItemsCard items={order.items} total={order.total} />
      <section
        aria-label={MESSAGES.ORDERS.DELIVERY_ADDRESS}
        className="rounded-2xl border bg-card p-4"
      >
        <DeliveryAddress address={order.deliveryAddress} />
      </section>
      <CancellationSheet order={order} model={cancellation} />
    </>
  );
}

function MyOrderBody({ model }: { model: MyOrderModel }): JSX.Element {
  if (model.order !== undefined) {
    return <OrderTracking order={model.order} />;
  }
  if (model.notFound) {
    return (
      <OrderNotFound>
        <Button asChild variant="outline">
          <Link to={PARENT_PATH}>{TRACKING_MESSAGES.BACK_TO_LIST}</Link>
        </Button>
      </OrderNotFound>
    );
  }
  if (model.loadError !== null) {
    return <OrderLoadError detail={model.loadError} />;
  }
  return <OrderDetailSkeleton />;
}

export function MyOrderScreen(): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.STORE_MY_ORDERS);
  const model: MyOrderModel = useMyOrder();
  const title: string | undefined =
    model.order === undefined ? screen?.label : MESSAGES.ORDERS.TITLE(model.order.number);

  return (
    <>
      <PageHeader
        title={title}
        back={<BackLink to={PARENT_PATH} label={TRACKING_MESSAGES.BACK} />}
      />
      <section className="flex flex-1 flex-col gap-4 px-4 pb-8 md:px-8">
        <MyOrderBody model={model} />
      </section>
    </>
  );
}
