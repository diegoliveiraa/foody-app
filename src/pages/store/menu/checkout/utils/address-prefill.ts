import type { DeliveryAddress } from "@/@types/orders";
import { EMPTY_TEXT } from "@/constants/validation";
import type { CheckoutFormInput } from "@/services/validation-schemas/delivery-address";
import { PREFILL_STATES } from "../constants";
import type { PrefillState } from "../types";

export function toCheckoutForm(address: DeliveryAddress): CheckoutFormInput {
  return {
    deliveryAddress: {
      zipCode: address.zipCode,
      street: address.street,
      number: address.number,
      complement: address.complement ?? EMPTY_TEXT,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
    },
  };
}

export function nextPrefillState(
  current: PrefillState,
  arrived: boolean,
  typed: boolean,
): PrefillState {
  if (current !== PREFILL_STATES.WAITING || !arrived) {
    return current;
  }
  return typed ? PREFILL_STATES.SKIPPED : PREFILL_STATES.APPLIED;
}
