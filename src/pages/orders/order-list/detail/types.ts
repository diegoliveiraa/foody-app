import type { FormEvent } from "react";
import type { StaffCancellationRequest, StaffOrder, StaffOrderHistoryEntry } from "@/@types/orders";
import type { DecisionForm } from "@/services/validation-schemas/cancellation";
import type { DECISIONS } from "./constants";

export interface HistoryEntryView {
  key: string;
  dot: string;
  title: string;
  detail: string;
  reason: string | null;
  note: string | null;
}

export interface StaffOrderModel {
  order: StaffOrder | undefined;
  loading: boolean;
  notFound: boolean;
  loadError: string | null;
}

export interface HistorySource {
  history: readonly StaffOrderHistoryEntry[];
  cancellationRequest?: StaffCancellationRequest | null;
  customer: Pick<StaffOrder["customer"], "name">;
}

export type Decision = (typeof DECISIONS)[keyof typeof DECISIONS];

export interface DecisionDialogState {
  decision: Decision;
  open: boolean;
}

export interface DecisionCopy {
  action: string;
  title: (number: number) => string;
  description: string;
  done: (number: number) => string;
}

export interface DecisionModel {
  canDecide: boolean;
  dialog: DecisionDialogState | null;
  form: DecisionForm;
  sending: boolean;
  ask: (decision: Decision) => void;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}
