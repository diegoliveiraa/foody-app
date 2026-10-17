import type { LucideIcon } from "lucide-react";
import { useId, type JSX } from "react";
import type { StaffOrder } from "@/@types/orders";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StaffCancelDialog } from "../../components/staff-cancel-dialog";
import { ADVANCE_ICONS } from "../../constants";
import { ORDER_ACTION_MESSAGES } from "../../constants/messages";
import type { NextStep, OrderActionsModel } from "../../types";
import { ORDER_DETAIL_MESSAGES } from "../constants/messages";

interface NextStepCardProps {
  order: StaffOrder;
  actions: OrderActionsModel;
  pending: boolean;
}

interface AdvanceButtonProps {
  step: NextStep;
  actions: OrderActionsModel;
}

function AdvanceButton({ step, actions }: AdvanceButtonProps): JSX.Element {
  const Icon: LucideIcon = ADVANCE_ICONS[step.status];

  return (
    <Button
      type="button"
      size="lg"
      disabled={actions.busy}
      aria-busy={actions.busy}
      onClick={actions.advance}
      className="h-13 rounded-[14px] text-base"
    >
      {actions.busy ? <Spinner aria-hidden="true" /> : <Icon aria-hidden="true" />}
      {step.label}
    </Button>
  );
}

export function NextStepCard({ order, actions, pending }: NextStepCardProps): JSX.Element | null {
  const titleId: string = useId();
  const blocked: boolean = pending && actions.mayAdvance;

  if (!blocked && actions.nextStep === null && !actions.canCancel) {
    return null;
  }
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-2.5 rounded-2xl border bg-card p-4"
    >
      <h2 id={titleId} className="font-sans text-[15px] font-bold">
        {ORDER_DETAIL_MESSAGES.NEXT_STEP}
      </h2>
      {blocked && (
        <p className="text-[13px] text-muted-foreground">{ORDER_DETAIL_MESSAGES.DECIDE_FIRST}</p>
      )}
      {actions.nextStep !== null && <AdvanceButton step={actions.nextStep} actions={actions} />}
      {actions.canCancel && (
        <>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            disabled={actions.busy}
            onClick={actions.cancelDialog.show}
            className="h-12 rounded-[14px] text-[15px]"
          >
            {ORDER_ACTION_MESSAGES.CANCEL_ORDER}
          </Button>
          <StaffCancelDialog
            orderNumber={order.number}
            reasons={order.cancellationReasons}
            model={actions.cancelDialog}
          />
        </>
      )}
    </section>
  );
}
