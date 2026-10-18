import { ZIP_CODE_DIGITS, ZIP_CODE_SEPARATOR } from "@/constants/orders";
import { EMPTY_TEXT } from "@/constants/validation";
import type { KeepStateOptions } from "react-hook-form";
import type { CheckoutFormInput } from "@/services/validation-schemas/delivery-address";

export const EMPTY_CHECKOUT_FORM: CheckoutFormInput = {
  deliveryAddress: {
    zipCode: EMPTY_TEXT,
    street: EMPTY_TEXT,
    number: EMPTY_TEXT,
    complement: EMPTY_TEXT,
    neighborhood: EMPTY_TEXT,
    city: EMPTY_TEXT,
    state: EMPTY_TEXT,
  },
};

export const NO_CODE_FIELDS: Readonly<Partial<Record<string, never>>> = {};

export const ZIP_CODE_MASKED_LENGTH: number = ZIP_CODE_DIGITS + ZIP_CODE_SEPARATOR.length;

export const PREFILL_STATES = {
  WAITING: "waiting",
  APPLIED: "applied",
  SKIPPED: "skipped",
} as const;

export const KEEP_TYPED_VALUES: KeepStateOptions = { keepDirtyValues: true };
