import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import type { CancellationReason } from "@/@types/orders";
import { EMPTY_CANCELLATION_FORM } from "@/constants/orders";
import {
  cancellationSchema,
  type CancellationForm,
  type CancellationFormInput,
  type CancellationFormValues,
} from "@/services/validation-schemas/cancellation";

type CancellationResolver = Resolver<CancellationFormInput, unknown, CancellationFormValues>;

export function useCancellationForm(reasons: readonly CancellationReason[]): CancellationForm {
  const resolver: CancellationResolver = useMemo(
    (): CancellationResolver => zodResolver(cancellationSchema(reasons)),
    [reasons],
  );
  return useForm<CancellationFormInput, unknown, CancellationFormValues>({
    resolver,
    defaultValues: EMPTY_CANCELLATION_FORM,
  });
}
