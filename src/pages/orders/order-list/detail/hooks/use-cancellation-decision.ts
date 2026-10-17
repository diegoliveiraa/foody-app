import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { StaffOrder } from "@/@types/orders";
import { CANCELLATION_REQUEST_STATUSES, EMPTY_DECISION_FORM } from "@/constants/orders";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useOrderFormSubmit } from "@/hooks/use-order-form-submit";
import { useApproveCancellationMutation, useDeclineCancellationMutation } from "@/services/orders";
import {
  DECISION_FIELDS,
  decisionSchema,
  type DecisionForm,
  type DecisionFormInput,
  type DecisionFormValues,
} from "@/services/validation-schemas/cancellation";
import { closeTarget } from "@/utils/dialog-target";
import { DECISIONS } from "../constants";
import { DECISION_COPY } from "../constants/messages";
import type { Decision, DecisionDialogState, DecisionModel } from "../types";

type DecisionTrigger = ReturnType<typeof useApproveCancellationMutation>[0];

export function useCancellationDecision(order: StaffOrder): DecisionModel {
  const mayDecide: boolean = useCan(
    SCREEN_KEYS.ORDERS_ORDER_LIST,
    SCREEN_ACTIONS.DECIDE_CANCELLATION,
  );
  const [dialog, setDialog] = useState<DecisionDialogState | null>(null);
  const form: DecisionForm = useForm<DecisionFormInput, unknown, DecisionFormValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: EMPTY_DECISION_FORM,
  });
  const [approveCancellation, { isLoading: approving }] = useApproveCancellationMutation();
  const [declineCancellation, { isLoading: declining }] = useDeclineCancellationMutation();
  const resetForm: DecisionForm["reset"] = form.reset;
  const senders: Record<Decision, DecisionTrigger> = {
    [DECISIONS.APPROVE]: approveCancellation,
    [DECISIONS.DECLINE]: declineCancellation,
  };

  const ask = useCallback(
    (decision: Decision): void => {
      resetForm(EMPTY_DECISION_FORM);
      setDialog({ decision, open: true });
    },
    [resetForm],
  );

  const close = useCallback((): void => {
    setDialog(closeTarget);
  }, []);

  const send = async (values: DecisionFormValues): Promise<void> => {
    if (dialog === null) {
      return;
    }
    await senders[dialog.decision]({ id: order.id, ...values }).unwrap();
    toast.success(DECISION_COPY[dialog.decision].done(order.number));
    close();
  };

  const submit: (event: FormEvent<HTMLFormElement>) => void = useOrderFormSubmit(
    form,
    DECISION_FIELDS,
    send,
    close,
  );

  return {
    canDecide:
      mayDecide && order.cancellationRequest?.status === CANCELLATION_REQUEST_STATUSES.PENDING,
    dialog,
    form,
    sending: approving || declining,
    ask,
    close,
    submit,
  };
}
