import type { FormEvent } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { NO_CANCELLATION_CODE_FIELDS } from "@/constants/orders";
import { isStaleOrderError } from "@/utils/stale-order";
import { useFormApiErrors } from "./use-form-api-errors";
import { useNotifyError } from "./use-notify-error";

export function useOrderFormSubmit<TInput extends FieldValues, TValues>(
  form: UseFormReturn<TInput, unknown, TValues>,
  fields: readonly Path<TInput>[],
  send: (values: TValues) => Promise<void>,
  close: () => void,
): (event: FormEvent<HTMLFormElement>) => void {
  const notifyError: (error: unknown) => void = useNotifyError();
  const showFormError: (error: unknown) => void = useFormApiErrors(
    form.setError,
    fields,
    NO_CANCELLATION_CODE_FIELDS,
  );

  const fail = (error: unknown): void => {
    if (isStaleOrderError(error)) {
      notifyError(error);
      close();
      return;
    }
    showFormError(error);
  };

  return (event: FormEvent<HTMLFormElement>): void => {
    form.handleSubmit(send)(event).catch(fail);
  };
}
