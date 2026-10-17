import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useNavigate, useSearchParams, type NavigateFunction } from "react-router";
import { ERROR_CODES } from "@/constants/api";
import { REDIRECT_TO_PARAM, ROUTE_PATHS } from "@/constants/routes";
import { MS_PER_SECOND } from "@/constants/time";
import { useCountdown } from "@/hooks/use-countdown";
import { useLoginMutation } from "@/services/auth";
import { loginSchema, type LoginValues } from "@/services/validation-schemas/login";
import { extractApiError, type ApiErrorInfo } from "@/utils/api-error";
import { safeRedirectPath } from "@/utils/safe-redirect-path";
import { LOGIN_DEFAULTS } from "../constants";
import type { LoginFormModel } from "../types";

export function useLoginForm(): LoginFormModel {
  const form: UseFormReturn<LoginValues> = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: LOGIN_DEFAULTS,
  });
  const [login] = useLoginMutation();
  const navigate: NavigateFunction = useNavigate();
  const [searchParams] = useSearchParams();
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const waitSeconds: number = useCountdown(lockedUntil);

  const showError = (error: unknown): void => {
    const info: ApiErrorInfo = extractApiError(error);
    if (info.code === ERROR_CODES.RATE_LIMITED && info.retryAfterSeconds !== null) {
      setLockedUntil(Date.now() + info.retryAfterSeconds * MS_PER_SECOND);
      return;
    }
    form.setError("root", { message: info.detail });
  };

  const signIn = async (values: LoginValues): Promise<void> => {
    await login(values).unwrap();
    const destination: string =
      safeRedirectPath(searchParams.get(REDIRECT_TO_PARAM)) ?? ROUTE_PATHS.HOME;
    await navigate(destination, { replace: true });
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    form.handleSubmit(signIn)(event).catch(showError);
  };

  return { form, submit, waitSeconds };
}
