import type { FormEvent } from "react";
import type { CustomerOrder, OrderStatus } from "@/@types/orders";
import type { CancellationForm } from "@/services/validation-schemas/cancellation";
import type { CANCELLATION_STATES, SHEET_MODES, STEP_STATES } from "./constants";

export type StepState = (typeof STEP_STATES)[keyof typeof STEP_STATES];

export type SheetMode = (typeof SHEET_MODES)[keyof typeof SHEET_MODES];

export type CancellationState = (typeof CANCELLATION_STATES)[keyof typeof CANCELLATION_STATES];

export interface CancellationGrants {
  cancel: boolean;
  request: boolean;
}

export interface TrackingStep {
  status: OrderStatus;
  state: StepState;
  reachedAt: string | null;
}

export interface MyOrderModel {
  order: CustomerOrder | undefined;
  loading: boolean;
  notFound: boolean;
  loadError: string | null;
}

export interface SheetCopy {
  intro: string;
  open: string;
  title: string;
  explanation: string | null;
  submit: string;
  done: (number: number) => string;
}

export interface CancellationSheetState {
  mode: SheetMode;
  open: boolean;
}

export interface CancellationModel {
  state: CancellationState | null;
  sheet: CancellationSheetState | null;
  form: CancellationForm;
  sending: boolean;
  show: (mode: SheetMode) => void;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}
