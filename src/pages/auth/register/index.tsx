import type { JSX } from "react";
import type { FormState } from "react-hook-form";
import { AuthSwitch } from "@/components/auth-layout/auth-switch";
import { DocumentTitle } from "@/components/document-title";
import { FormAlert } from "@/components/form-alert";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import type { RegisterValues } from "@/services/validation-schemas/register";
import { useRegisterForm } from "./hooks/use-register-form";
import type { RegisterFormModel } from "./types";

export function RegisterScreen(): JSX.Element {
  const { form, submit, loginPath }: RegisterFormModel = useRegisterForm();
  const { errors, isSubmitting }: FormState<RegisterValues> = form.formState;

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4.5">
      <DocumentTitle label={MESSAGES.REGISTER.TITLE} />
      <h1 className="text-[26px] font-bold">{MESSAGES.REGISTER.TITLE}</h1>
      <FormAlert message={errors.root?.message} />
      <FormField
        label={MESSAGES.FIELDS.NAME}
        autoComplete="name"
        error={errors.name?.message}
        {...form.register("name")}
      />
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
        autoComplete="new-password"
        error={errors.password?.message}
        {...form.register("password")}
      />
      <Button type="submit" size="lg" className="mt-1.5" disabled={isSubmitting}>
        {MESSAGES.REGISTER.SUBMIT}
      </Button>
      <AuthSwitch
        question={MESSAGES.REGISTER.HAS_ACCOUNT}
        linkLabel={MESSAGES.REGISTER.LOGIN_LINK}
        to={loginPath}
      />
    </form>
  );
}
