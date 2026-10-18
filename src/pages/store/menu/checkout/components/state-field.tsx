import { useId, type JSX } from "react";
import type { ControllerFieldState, ControllerRenderProps } from "react-hook-form";
import type { BrazilianState } from "@/@types/orders";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAZILIAN_STATE_LIST } from "@/constants/orders";
import type { CheckoutFormInput } from "@/services/validation-schemas/delivery-address";
import { CHECKOUT_MESSAGES } from "../constants/messages";

interface StateFieldProps {
  field: ControllerRenderProps<CheckoutFormInput, "deliveryAddress.state">;
  fieldState: ControllerFieldState;
}

export function StateField({
  field: { ref, name, value, onChange, onBlur },
  fieldState,
}: StateFieldProps): JSX.Element {
  const id: string = useId();
  const errorId: string = `${id}-error`;
  const invalid: boolean = fieldState.error !== undefined;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{CHECKOUT_MESSAGES.STATE}</FieldLabel>
      <Select name={name} value={value} onValueChange={onChange} autoComplete="address-level1">
        <SelectTrigger
          ref={ref}
          id={id}
          onBlur={onBlur}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className="w-full min-w-0 data-[size=default]:h-12"
        >
          <SelectValue placeholder={CHECKOUT_MESSAGES.CHOOSE_STATE} />
        </SelectTrigger>
        <SelectContent>
          {BRAZILIAN_STATE_LIST.map((state: BrazilianState): JSX.Element => (
            <SelectItem key={state} value={state}>
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError id={errorId}>{fieldState.error?.message}</FieldError>
    </Field>
  );
}
