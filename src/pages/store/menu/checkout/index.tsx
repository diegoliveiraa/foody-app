import type { JSX } from "react";
import { BackLink } from "@/components/back-link";
import { FormAlert } from "@/components/form-alert";
import { PageHeader } from "@/components/page-header";
import { PARENT_PATH } from "@/constants/routes";
import { AddressFieldset } from "./components/address-fieldset";
import { CheckoutEmpty } from "./components/checkout-empty";
import { CheckoutSummary } from "./components/checkout-summary";
import { PlaceOrderButton } from "./components/place-order-button";
import { CHECKOUT_MESSAGES } from "./constants/messages";
import { useCheckout } from "./hooks/use-checkout";
import type { CheckoutModel } from "./types";

function CheckoutForm({ checkout }: { checkout: CheckoutModel }): JSX.Element {
  return (
    <form
      noValidate
      onSubmit={checkout.submit}
      className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start"
    >
      <AddressFieldset form={checkout.form} />
      <div className="flex flex-col gap-4">
        <CheckoutSummary
          quote={checkout.quote}
          lines={checkout.lines}
          pendingLines={checkout.pendingLines}
        />
        <FormAlert message={checkout.form.formState.errors.root?.message} />
        <PlaceOrderButton
          quote={checkout.quote}
          placing={checkout.placing}
          disabled={!checkout.canPlace}
        />
      </div>
    </form>
  );
}

export function CheckoutScreen(): JSX.Element {
  const checkout: CheckoutModel = useCheckout();

  return (
    <>
      <PageHeader
        title={CHECKOUT_MESSAGES.TITLE}
        back={<BackLink to={PARENT_PATH} label={CHECKOUT_MESSAGES.BACK} />}
      />
      <section className="flex flex-1 flex-col px-4 pb-8 md:px-8">
        {checkout.empty ? <CheckoutEmpty /> : <CheckoutForm checkout={checkout} />}
      </section>
    </>
  );
}
