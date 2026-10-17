import { MapPin } from "lucide-react";
import type { ChangeEvent, JSX } from "react";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldErrors,
} from "react-hook-form";
import { FormField } from "@/components/form-field";
import type { CheckoutFormInput } from "@/services/validation-schemas/delivery-address";
import { maskZipCode } from "@/utils/zip-code";
import { ZIP_CODE_MASKED_LENGTH } from "../constants";
import { CHECKOUT_MESSAGES } from "../constants/messages";
import type { CheckoutForm } from "../types";
import { StateField } from "./state-field";

interface AddressFieldsetProps {
  form: CheckoutForm;
}

interface ZipCodeFieldProps {
  field: ControllerRenderProps<CheckoutFormInput, "deliveryAddress.zipCode">;
  fieldState: ControllerFieldState;
}

type AddressErrors = FieldErrors<CheckoutFormInput>["deliveryAddress"];

function ZipCodeField({ field, fieldState }: ZipCodeFieldProps): JSX.Element {
  return (
    <FormField
      label={CHECKOUT_MESSAGES.ZIP_CODE}
      inputMode="numeric"
      autoComplete="postal-code"
      placeholder={CHECKOUT_MESSAGES.ZIP_CODE_PLACEHOLDER}
      maxLength={ZIP_CODE_MASKED_LENGTH}
      error={fieldState.error?.message}
      {...field}
      onChange={(event: ChangeEvent<HTMLInputElement>): void =>
        field.onChange(maskZipCode(event.target.value))
      }
    />
  );
}

export function AddressFieldset({ form }: AddressFieldsetProps): JSX.Element {
  const errors: AddressErrors = form.formState.errors.deliveryAddress;

  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card px-4 pt-4 pb-5">
      <legend className="float-left flex w-full items-center gap-2 text-base font-bold">
        <MapPin aria-hidden="true" className="size-[18px] text-primary" />
        {CHECKOUT_MESSAGES.ADDRESS}
      </legend>
      <Controller
        control={form.control}
        name="deliveryAddress.zipCode"
        render={({ field, fieldState }): JSX.Element => (
          <ZipCodeField field={field} fieldState={fieldState} />
        )}
      />
      <FormField
        label={CHECKOUT_MESSAGES.STREET}
        autoComplete="address-line1"
        error={errors?.street?.message}
        {...form.register("deliveryAddress.street")}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label={CHECKOUT_MESSAGES.NUMBER}
          autoComplete="off"
          error={errors?.number?.message}
          {...form.register("deliveryAddress.number")}
        />
        <FormField
          label={CHECKOUT_MESSAGES.COMPLEMENT}
          placeholder={CHECKOUT_MESSAGES.COMPLEMENT_PLACEHOLDER}
          autoComplete="address-line2"
          error={errors?.complement?.message}
          {...form.register("deliveryAddress.complement")}
        />
      </div>
      <FormField
        label={CHECKOUT_MESSAGES.NEIGHBORHOOD}
        autoComplete="address-level3"
        error={errors?.neighborhood?.message}
        {...form.register("deliveryAddress.neighborhood")}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
        <FormField
          label={CHECKOUT_MESSAGES.CITY}
          autoComplete="address-level2"
          error={errors?.city?.message}
          {...form.register("deliveryAddress.city")}
        />
        <Controller
          control={form.control}
          name="deliveryAddress.state"
          render={({ field, fieldState }): JSX.Element => (
            <StateField field={field} fieldState={fieldState} />
          )}
        />
      </div>
    </fieldset>
  );
}
