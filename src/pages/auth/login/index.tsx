import type { JSX } from "react";
import type { FormState } from "react-hook-form";
import { AuthSwitch } from "@/components/auth-layout/auth-switch";
import { FormAlert } from "@/components/form-alert";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { ROUTE_PATHS } from "@/constants/routes";
import type { LoginValues } from "@/services/validation-schemas/login";
import { useLoginForm } from "./hooks/use-login-form";
import type { LoginFormModel } from "./types";

export function LoginScreen(): JSX.Element {
  const { form, submit, waitSeconds }: LoginFormModel = useLoginForm();
  const { errors, isSubmitting }: FormState<LoginValues> = form.formState;
  const locked: boolean = waitSeconds > 0;

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4.5">
      <h1 className="text-[26px] font-bold">{MESSAGES.LOGIN.TITLE}</h1>
      <FormAlert message={errors.root?.message} />
      <FormField
        label={MESSAGES.FIELDS.EMAIL}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...form.register("email")}
      />
      <FormField
        label={MESSAGES.FIELDS.PASSWORD}
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...form.register("password")}
      />
      <Button type="submit" size="lg" className="mt-1.5" disabled={isSubmitting || locked}>
        {locked ? MESSAGES.LOGIN.WAIT(waitSeconds) : MESSAGES.LOGIN.SUBMIT}
      </Button>
      <AuthSwitch
        question={MESSAGES.LOGIN.NO_ACCOUNT}
        linkLabel={MESSAGES.LOGIN.REGISTER_LINK}
        to={ROUTE_PATHS.REGISTER}
      />
    </form>
  );
}
