import { useCallback, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MESSAGES } from "@/constants/messages";
import { EMPTY_CANCELLATION_FORM } from "@/constants/orders";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useCancellationForm } from "@/hooks/use-cancellation-form";
import { useNotifyError } from "@/hooks/use-notify-error";
import { useOrderFormSubmit } from "@/hooks/use-order-form-submit";
import { useCancelOrderMutation, useUpdateOrderStatusMutation } from "@/services/orders";
import {
  CANCELLATION_FIELDS,
  type CancellationForm,
  type CancellationFormValues,
} from "@/services/validation-schemas/cancellation";
import type { NextStep, OrderActionsModel, OrderActionTarget } from "../types";
import { toNextStep } from "../utils/next-step";

export function useOrderActions(order: OrderActionTarget): OrderActionsModel {
  const canAdvance: boolean = useCan(SCREEN_KEYS.ORDERS_ORDER_LIST, SCREEN_ACTIONS.UPDATE_STATUS);
  const mayCancel: boolean = useCan(SCREEN_KEYS.ORDERS_ORDER_LIST, SCREEN_ACTIONS.CANCEL);
  const nextStep: NextStep | null = useMemo(
    (): NextStep | null => (canAdvance ? toNextStep(order.allowedTransitions) : null),
    [canAdvance, order.allowedTransitions],
  );
  const [cancelOpen, setCancelOpen] = useState<boolean>(false);
  const form: CancellationForm = useCancellationForm(order.cancellationReasons);
  const [updateOrderStatus, { isLoading: advancing }] = useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const notifyError: (error: unknown) => void = useNotifyError();
  const resetForm: CancellationForm["reset"] = form.reset;

  const show = useCallback((): void => {
    resetForm(EMPTY_CANCELLATION_FORM);
    setCancelOpen(true);
  }, [resetForm]);

  const close = useCallback((): void => {
    setCancelOpen(false);
  }, []);

  const send = async (values: CancellationFormValues): Promise<void> => {
    await cancelOrder({ id: order.id, ...values }).unwrap();
    toast.success(MESSAGES.ORDERS.CANCELLED(order.number));
    close();
  };

  const submit: (event: FormEvent<HTMLFormElement>) => void = useOrderFormSubmit(
    form,
    CANCELLATION_FIELDS,
    send,
    close,
  );

  const advance = (): void => {
    if (nextStep === null) {
      return;
    }
    updateOrderStatus({ id: order.id, status: nextStep.status })
      .unwrap()
      .then((): void => {
        toast.success(nextStep.done(order.number));
      })
      .catch(notifyError);
  };

  return {
    mayAdvance: canAdvance,
    nextStep,
    canCancel: mayCancel && order.canCancel,
    busy: advancing || cancelling,
    advance,
    cancelDialog: { open: cancelOpen, form, sending: cancelling, show, close, submit },
  };
}
