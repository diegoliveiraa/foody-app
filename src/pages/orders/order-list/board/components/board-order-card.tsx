import type { JSX } from "react";
import { Link } from "react-router";
import type { StaffOrderSummary } from "@/@types/orders";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MESSAGES } from "@/constants/messages";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { formatMoney } from "@/utils/format-money";
import { formatOrderAge } from "@/utils/format-order-date";
import { summarizeItems } from "@/utils/order-items";
import { StaffCancelDialog } from "../../components/staff-cancel-dialog";
import { ORDER_ACTION_MESSAGES, ORDER_LIST_MESSAGES } from "../../constants/messages";
import { useOrderActions } from "../../hooks/use-order-actions";
import type { OrderActionsModel } from "../../types";

interface BoardOrderCardProps {
  order: StaffOrderSummary;
  detailPath: string;
  now: number;
  showsCancel: boolean;
}

interface CardActionsProps {
  actions: OrderActionsModel;
  offersCancel: boolean;
}

interface RequestLinkProps {
  detailPath: string;
}

function RequestLink({ detailPath }: RequestLinkProps): JSX.Element | null {
  const canDecide: boolean = useCan(
    SCREEN_KEYS.ORDERS_ORDER_LIST,
    SCREEN_ACTIONS.DECIDE_CANCELLATION,
  );

  if (!canDecide) {
    return null;
  }
  return (
    <Button asChild className="relative z-10 ml-auto px-3.5">
      <Link to={detailPath}>{ORDER_LIST_MESSAGES.VIEW_REQUEST}</Link>
    </Button>
  );
}

function CardActions({ actions, offersCancel }: CardActionsProps): JSX.Element | null {
  if (!offersCancel && actions.nextStep === null) {
    return null;
  }
  return (
    <div className="relative z-10 ml-auto flex flex-wrap justify-end gap-2">
      {offersCancel && (
        <Button
          type="button"
          variant="outline"
          disabled={actions.busy}
          onClick={actions.cancelDialog.show}
          className="px-3.5"
        >
          {ORDER_ACTION_MESSAGES.CANCEL}
        </Button>
      )}
      {actions.nextStep !== null && (
        <Button
          type="button"
          disabled={actions.busy}
          aria-busy={actions.busy}
          onClick={actions.advance}
          className="px-3.5"
        >
          {actions.busy && <Spinner aria-hidden="true" />}
          {actions.nextStep.label}
        </Button>
      )}
    </div>
  );
}

export function BoardOrderCard({
  order,
  detailPath,
  now,
  showsCancel,
}: BoardOrderCardProps): JSX.Element {
  const actions: OrderActionsModel = useOrderActions(order);
  const pending: boolean = order.hasPendingCancellationRequest;
  const offersCancel: boolean = showsCancel && actions.canCancel;

  return (
    <article
      aria-label={MESSAGES.ORDERS.TITLE(order.number)}
      data-pending={pending}
      className="relative flex flex-col gap-1.5 rounded-2xl border bg-card p-4 transition-colors has-[a:hover]:bg-muted/40 data-[pending=true]:border-2 data-[pending=true]:border-attention-border"
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          to={detailPath}
          className="text-[17px] font-bold outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
        >
          {MESSAGES.ORDERS.NUMBER(order.number)}
        </Link>
        <span className="shrink-0 text-[13px] text-muted-foreground">
          {formatOrderAge(order.placedAt, now)}
        </span>
      </div>
      <span className="text-sm font-semibold break-words">{order.customerName}</span>
      <span className="text-sm break-words text-muted-foreground">
        {summarizeItems(order.items)}
      </span>
      {pending && (
        <span className="w-fit rounded-[10px] bg-brand-soft px-2.5 py-1.5 text-[13px] font-semibold text-secondary-foreground">
          {ORDER_LIST_MESSAGES.CUSTOMER_REQUESTED}
        </span>
      )}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className="text-base font-bold">{formatMoney(order.total)}</span>
        {pending ? (
          <RequestLink detailPath={detailPath} />
        ) : (
          <CardActions actions={actions} offersCancel={offersCancel} />
        )}
      </div>
      {offersCancel && (
        <StaffCancelDialog
          orderNumber={order.number}
          reasons={order.cancellationReasons}
          model={actions.cancelDialog}
        />
      )}
    </article>
  );
}
