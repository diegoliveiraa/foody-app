import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useNavigate, type NavigateFunction } from "react-router";
import { ERROR_CODES } from "@/constants/api";
import { ROUTE_PATHS } from "@/constants/routes";
import { useRegisterMutation } from "@/services/auth";
import {
  REGISTER_FIELDS,
  registerSchema,
  type RegisterField,
  type RegisterValues,
} from "@/services/validation-schemas/register";
import { extractApiError, type ApiErrorInfo } from "@/utils/api-error";
import { REGISTER_DEFAULTS } from "../constants";
import type { RegisterFormModel } from "../types";

type FieldMessage = [RegisterField, string];

function isRegisterField(field: string): field is RegisterField {
  return REGISTER_FIELDS.some((known: RegisterField): boolean => known === field);
}

function fieldMessagesOf(info: ApiErrorInfo): FieldMessage[] {
  return Object.entries(info.fieldErrors).filter((entry: [string, string]): entry is FieldMessage =>
    isRegisterField(entry[0]),
  );
}

export function useRegisterForm(): RegisterFormModel {
  const form: UseFormReturn<RegisterValues> = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: REGISTER_DEFAULTS,
  });
  const [register] = useRegisterMutation();
  const navigate: NavigateFunction = useNavigate();

  const showError = (error: unknown): void => {
    const info: ApiErrorInfo = extractApiError(error);
    if (info.code === ERROR_CODES.EMAIL_ALREADY_REGISTERED) {
      form.setError("email", { message: info.detail });
      return;
    }
    const fieldMessages: FieldMessage[] = fieldMessagesOf(info);
    if (fieldMessages.length === 0) {
      form.setError("root", { message: info.detail });
      return;
    }
    fieldMessages.forEach(([field, message]: FieldMessage): void =>
      form.setError(field, { message }),
    );
  };

  const signUp = async (values: RegisterValues): Promise<void> => {
    await register(values).unwrap();
    await navigate(ROUTE_PATHS.HOME, { replace: true });
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    form.handleSubmit(signUp)(event).catch(showError);
  };

  return { form, submit };
}
