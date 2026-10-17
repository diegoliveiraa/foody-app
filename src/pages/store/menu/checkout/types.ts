import type { FormEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import type {
  CheckoutFormInput,
  CheckoutFormValues,
} from "@/services/validation-schemas/delivery-address";
import type { CartQuoteModel } from "../types";

export type CheckoutForm = UseFormReturn<CheckoutFormInput, unknown, CheckoutFormValues>;

export interface SummaryLine {
  productId: string;
  label: string;
  subtotal: number | null;
  available: boolean;
}

export interface CheckoutModel {
  form: CheckoutForm;
  quote: CartQuoteModel;
  lines: readonly SummaryLine[];
  pendingLines: number;
  empty: boolean;
  placing: boolean;
  canPlace: boolean;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}
