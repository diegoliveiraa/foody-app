import type { FormEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import type {
  CheckoutFormInput,
  CheckoutFormValues,
} from "@/services/validation-schemas/delivery-address";
import type { CartQuoteModel } from "../types";
import type { PREFILL_STATES } from "./constants";

export type CheckoutForm = UseFormReturn<CheckoutFormInput, unknown, CheckoutFormValues>;

export type PrefillState = (typeof PREFILL_STATES)[keyof typeof PREFILL_STATES];

export interface CheckoutFormModel {
  form: CheckoutForm;
  prefilled: boolean;
}

export interface SummaryLine {
  productId: string;
  label: string;
  subtotal: number | null;
  available: boolean;
}

export interface CheckoutModel {
  form: CheckoutForm;
  prefilled: boolean;
  quote: CartQuoteModel;
  lines: readonly SummaryLine[];
  pendingLines: number;
  empty: boolean;
  placing: boolean;
  canPlace: boolean;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}
