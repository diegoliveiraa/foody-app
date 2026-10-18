import { describe, expect, it } from "vitest";
import type { DeliveryAddress } from "@/@types/orders";
import type { CheckoutFormInput } from "@/services/validation-schemas/delivery-address";
import { PAULISTA } from "@/test/orders";
import { PREFILL_STATES } from "../constants";
import type { PrefillState } from "../types";
import { nextPrefillState, toCheckoutForm } from "./address-prefill";

describe("toCheckoutForm", () => {
  it("fills every field of the form with the address of the last order", () => {
    const form: CheckoutFormInput = toCheckoutForm(PAULISTA);

    expect(form).toEqual({
      deliveryAddress: {
        zipCode: "01310-100",
        street: "Avenida Paulista",
        number: "1000",
        complement: "Apto 42",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      },
    });
  });

  it("leaves the complement empty when the last address had none", () => {
    const withoutComplement: DeliveryAddress = { ...PAULISTA, complement: null };

    const form: CheckoutFormInput = toCheckoutForm(withoutComplement);

    expect(form.deliveryAddress.complement).toBe("");
  });
});

describe("nextPrefillState", () => {
  it("keeps waiting while the last address has not arrived", () => {
    const state: PrefillState = nextPrefillState(PREFILL_STATES.WAITING, false, false);

    expect(state).toBe(PREFILL_STATES.WAITING);
  });

  it("fills the form when the last address arrives before anything was typed", () => {
    const state: PrefillState = nextPrefillState(PREFILL_STATES.WAITING, true, false);

    expect(state).toBe(PREFILL_STATES.APPLIED);
  });

  it("gives up on filling when the customer already typed something", () => {
    const state: PrefillState = nextPrefillState(PREFILL_STATES.WAITING, true, true);

    expect(state).toBe(PREFILL_STATES.SKIPPED);
  });

  it("decides only once, whatever is typed afterwards", () => {
    const applied: PrefillState = nextPrefillState(PREFILL_STATES.APPLIED, true, true);
    const skipped: PrefillState = nextPrefillState(PREFILL_STATES.SKIPPED, true, false);

    expect([applied, skipped]).toEqual([PREFILL_STATES.APPLIED, PREFILL_STATES.SKIPPED]);
  });
});
