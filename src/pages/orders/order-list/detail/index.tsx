import type { JSX } from "react";
import { Link } from "react-router";
import type { MeScreen } from "@/@types/me";
import type { StaffOrder } from "@/@types/orders";
import { BackLink } from "@/components/back-link";
import { DeliveryAddress } from "@/components/delivery-address";
import { OrderCancellation } from "@/components/order-cancellation";
import { OrderItemsCard } from "@/components/order-items-card";
import { OrderDetailSkeleton, OrderLoadError, OrderNotFound } from "@/components/order-states";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { CANCELLATION_REQUEST_STATUSES } from "@/constants/orders";
import { SCREEN_KEYS } from "@/constants/screens";
import { useMeScreen } from "@/hooks/use-me-screen";
import { useNow } from "@/hooks/use-now";
import { MS_PER_MINUTE } from "@/constants/time";
import { formatOrderTime } from "@/utils/format-order-date";
import { countUnits } from "@/utils/order-items";
import { useOrderActions } from "../hooks/use-order-actions";
import { useOrderListPaths } from "../hooks/use-order-list-paths";
import type { OrderActionsModel, OrderListPaths } from "../types";
import { CancellationRequestPanel } from "./components/cancellation-request-panel";
import { CustomerCard } from "./components/customer-card";
import { DecisionDialog } from "./components/decision-dialog";
import { NextStepCard } from "./components/next-step-card";
import { OrderHistoryList } from "./components/order-history-list";
import { ORDER_DETAIL_MESSAGES } from "./constants/messages";
import { useCancellationDecision } from "./hooks/use-cancellation-decision";
import { useStaffOrder } from "./hooks/use-staff-order";
import type { DecisionModel, StaffOrderModel } from "./types";

interface StaffOrderBodyProps {
  model: StaffOrderModel;
  boardPath: string;
}

function StaffOrderSections({ order }: { order: StaffOrder }): JSX.Element {
  const actions: OrderActionsModel = useOrderActions(order);
  const decision: DecisionModel = useCancellationDecision(order);
  const pending: boolean =
    order.cancellationRequest?.status === CANCELLATION_REQUEST_STATUSES.PENDING;

  return (
    <>
      <CancellationRequestPanel order={order} decision={decision} />
      {order.cancellation && <OrderCancellation cancellation={order.cancellation} />}
      <NextStepCard order={order} actions={actions} pending={pending} />
      <CustomerCard customer={order.customer} />
      <OrderItemsCard items={order.items} total={order.total}>
        <DeliveryAddress address={order.deliveryAddress} className="pt-1.5" />
      </OrderItemsCard>
      <OrderHistoryList order={order} />
      <DecisionDialog orderNumber={order.number} model={decision} />
    </>
  );
}

function StaffOrderBody({ model, boardPath }: StaffOrderBodyProps): JSX.Element {
  if (model.order !== undefined) {
    return <StaffOrderSections order={model.order} />;
  }
  if (model.notFound) {
    return (
      <OrderNotFound>
        <Button asChild variant="outline">
          <Link to={boardPath}>{ORDER_DETAIL_MESSAGES.BACK}</Link>
        </Button>
      </OrderNotFound>
    );
  }
  if (model.loadError !== null) {
    return <OrderLoadError detail={model.loadError} />;
  }
  return <OrderDetailSkeleton />;
}

function placedLine(order: StaffOrder, now: number): string {
  return ORDER_DETAIL_MESSAGES.PLACED(
    formatOrderTime(order.placedAt, now),
    ORDER_DETAIL_MESSAGES.UNITS(countUnits(order.items)),
  );
}

export function OrderDetailScreen(): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.ORDERS_ORDER_LIST);
  const model: StaffOrderModel = useStaffOrder();
  const paths: OrderListPaths = useOrderListPaths();
  const now: number = useNow(MS_PER_MINUTE);
  const { order } = model;

  return (
    <>
      <PageHeader
        title={
          order === undefined
            ? screen?.label
            : ORDER_DETAIL_MESSAGES.TITLE(order.number, order.customer.name)
        }
        description={order === undefined ? undefined : placedLine(order, now)}
        back={<BackLink to={paths.board} label={ORDER_DETAIL_MESSAGES.BACK} />}
      >
        {order !== undefined && <OrderStatusBadge status={order.status} className="shrink-0" />}
      </PageHeader>
      <section className="flex flex-1 flex-col gap-4 px-4 pb-8 md:px-8">
        <StaffOrderBody model={model} boardPath={paths.board} />
      </section>
    </>
  );
}
