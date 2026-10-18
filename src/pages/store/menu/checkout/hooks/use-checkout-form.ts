import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { DeliveryAddress } from "@/@types/orders";
import {
  checkoutSchema,
  type CheckoutFormInput,
  type CheckoutFormValues,
} from "@/services/validation-schemas/delivery-address";
import { EMPTY_CHECKOUT_FORM, KEEP_TYPED_VALUES, PREFILL_STATES } from "../constants";
import type { CheckoutForm, CheckoutFormModel, PrefillState } from "../types";
import { nextPrefillState, toCheckoutForm } from "../utils/address-prefill";
import { useLastDeliveryAddress } from "./use-last-delivery-address";

export function useCheckoutForm(empty: boolean): CheckoutFormModel {
  const lastAddress: DeliveryAddress | undefined = useLastDeliveryAddress(empty);
  const [prefill, setPrefill] = useState<PrefillState>(PREFILL_STATES.WAITING);
  const prefillValues: CheckoutFormInput | undefined = useMemo(
    (): CheckoutFormInput | undefined =>
      prefill === PREFILL_STATES.APPLIED && lastAddress !== undefined
        ? toCheckoutForm(lastAddress)
        : undefined,
    [prefill, lastAddress],
  );
  const form: CheckoutForm = useForm<CheckoutFormInput, unknown, CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: EMPTY_CHECKOUT_FORM,
    values: prefillValues,
    resetOptions: KEEP_TYPED_VALUES,
    shouldFocusError: false,
  });
  const typed: boolean = form.formState.isDirty;
  const next: PrefillState = nextPrefillState(prefill, lastAddress !== undefined, typed);
  if (next !== prefill) {
    setPrefill(next);
  }

  return { form, prefilled: prefill === PREFILL_STATES.APPLIED && !typed };
}
