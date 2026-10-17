import type { FormEvent } from "react";
import type { OrderId, StaffOrderSummary } from "@/@types/orders";
import type { AdvanceStatus } from "@/constants/orders";
import type { CancellationForm } from "@/services/validation-schemas/cancellation";

export interface OrderListPaths {
  board: string;
  history: string;
  detail: (id: OrderId) => string;
}

export interface NextStep {
  status: AdvanceStatus;
  label: string;
  done: (number: number) => string;
}

export type OrderActionTarget = Pick<
  StaffOrderSummary,
  "id" | "number" | "allowedTransitions" | "canCancel" | "cancellationReasons"
>;

export interface CancelDialogModel {
  open: boolean;
  form: CancellationForm;
  sending: boolean;
  show: () => void;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface OrderActionsModel {
  mayAdvance: boolean;
  nextStep: NextStep | null;
  canCancel: boolean;
  busy: boolean;
  advance: () => void;
  cancelDialog: CancelDialogModel;
}
