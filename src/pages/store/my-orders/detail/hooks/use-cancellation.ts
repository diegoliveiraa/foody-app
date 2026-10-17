import { useCallback, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { CustomerOrder } from "@/@types/orders";
import { EMPTY_CANCELLATION_FORM } from "@/constants/orders";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useCancellationForm } from "@/hooks/use-cancellation-form";
import { useOrderFormSubmit } from "@/hooks/use-order-form-submit";
import { useCancelMyOrderMutation, useRequestCancellationMutation } from "@/services/my-orders";
import {
  CANCELLATION_FIELDS,
  type CancellationForm,
  type CancellationFormValues,
} from "@/services/validation-schemas/cancellation";
import { closeTarget } from "@/utils/dialog-target";
import { SHEET_MODES } from "../constants";
import { SHEET_COPY } from "../constants/messages";
import type { CancellationModel, CancellationSheetState, SheetMode } from "../types";
import { cancellationStateOf } from "../utils/cancellation-state";

type CancellationTrigger = ReturnType<typeof useCancelMyOrderMutation>[0];

export function useCancellation(order: CustomerOrder): CancellationModel {
  const canCancel: boolean = useCan(SCREEN_KEYS.STORE_MY_ORDERS, SCREEN_ACTIONS.CANCEL);
  const canRequest: boolean = useCan(
    SCREEN_KEYS.STORE_MY_ORDERS,
    SCREEN_ACTIONS.REQUEST_CANCELLATION,
  );
  const [sheet, setSheet] = useState<CancellationSheetState | null>(null);
  const form: CancellationForm = useCancellationForm(order.cancellationReasons);
  const [cancelMyOrder, { isLoading: cancelling }] = useCancelMyOrderMutation();
  const [requestCancellation, { isLoading: requesting }] = useRequestCancellationMutation();
  const resetForm: CancellationForm["reset"] = form.reset;
  const senders: Record<SheetMode, CancellationTrigger> = {
    [SHEET_MODES.CANCEL]: cancelMyOrder,
    [SHEET_MODES.REQUEST]: requestCancellation,
  };

  const show = useCallback(
    (mode: SheetMode): void => {
      resetForm(EMPTY_CANCELLATION_FORM);
      setSheet({ mode, open: true });
    },
    [resetForm],
  );

  const close = useCallback((): void => {
    setSheet(closeTarget);
  }, []);

  const send = async (values: CancellationFormValues): Promise<void> => {
    if (sheet === null) {
      return;
    }
    await senders[sheet.mode]({ id: order.id, ...values }).unwrap();
    toast.success(SHEET_COPY[sheet.mode].done(order.number));
    close();
  };

  const submit: (event: FormEvent<HTMLFormElement>) => void = useOrderFormSubmit(
    form,
    CANCELLATION_FIELDS,
    send,
    close,
  );

  return {
    state: cancellationStateOf(order, { cancel: canCancel, request: canRequest }),
    sheet,
    form,
    sending: cancelling || requesting,
    show,
    close,
    submit,
  };
}
