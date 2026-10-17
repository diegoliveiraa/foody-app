import { z } from "zod";
import { MESSAGES } from "@/constants/messages";
import {
  ADDRESS_NUMBER_MAX_LENGTH,
  ADDRESS_NUMBER_MIN_LENGTH,
  BRAZILIAN_STATES,
  CITY_MAX_LENGTH,
  CITY_MIN_LENGTH,
  COMPLEMENT_MAX_LENGTH,
  NEIGHBORHOOD_MAX_LENGTH,
  NEIGHBORHOOD_MIN_LENGTH,
  STREET_MAX_LENGTH,
  STREET_MIN_LENGTH,
} from "@/constants/orders";
import { EMPTY_TEXT, REQUIRED_MIN_LENGTH } from "@/constants/validation";
import { maskZipCode } from "@/utils/zip-code";

const ZIP_CODE_PATTERN: RegExp = /^\d{5}-?\d{3}$/;

const DELIVERY_ADDRESS_FIELD = "deliveryAddress" as const;

function toComplement(complement: string): string | null {
  return complement === EMPTY_TEXT ? null : complement;
}

function textBetween(min: number, max: number, error: string): z.ZodString {
  return z.string().trim().min(min, { error }).max(max, { error });
}

export const deliveryAddressSchema = z.object({
  zipCode: z
    .string()
    .trim()
    .regex(ZIP_CODE_PATTERN, { error: MESSAGES.VALIDATION.ZIP_CODE_INVALID })
    .transform(maskZipCode),
  street: textBetween(STREET_MIN_LENGTH, STREET_MAX_LENGTH, MESSAGES.VALIDATION.STREET_LENGTH),
  number: textBetween(
    ADDRESS_NUMBER_MIN_LENGTH,
    ADDRESS_NUMBER_MAX_LENGTH,
    MESSAGES.VALIDATION.ADDRESS_NUMBER_LENGTH,
  ),
  complement: z
    .string()
    .trim()
    .max(COMPLEMENT_MAX_LENGTH, { error: MESSAGES.VALIDATION.COMPLEMENT_TOO_LONG })
    .transform(toComplement),
  neighborhood: textBetween(
    NEIGHBORHOOD_MIN_LENGTH,
    NEIGHBORHOOD_MAX_LENGTH,
    MESSAGES.VALIDATION.NEIGHBORHOOD_LENGTH,
  ),
  city: textBetween(CITY_MIN_LENGTH, CITY_MAX_LENGTH, MESSAGES.VALIDATION.CITY_LENGTH),
  state: z
    .string()
    .min(REQUIRED_MIN_LENGTH, { error: MESSAGES.VALIDATION.STATE_REQUIRED, abort: true })
    .pipe(z.enum(BRAZILIAN_STATES, { error: MESSAGES.VALIDATION.STATE_REQUIRED })),
});

export const checkoutSchema = z.object({ [DELIVERY_ADDRESS_FIELD]: deliveryAddressSchema });

export type CheckoutFormInput = z.input<typeof checkoutSchema>;

export type CheckoutFormValues = z.output<typeof checkoutSchema>;

type AddressField = keyof z.input<typeof deliveryAddressSchema>;

export type CheckoutField = `${typeof DELIVERY_ADDRESS_FIELD}.${AddressField}`;

function fieldPathOf(field: AddressField): CheckoutField {
  return `${DELIVERY_ADDRESS_FIELD}.${field}`;
}

export const CHECKOUT_FIELDS: readonly CheckoutField[] = deliveryAddressSchema
  .keyof()
  .options.map(fieldPathOf);
