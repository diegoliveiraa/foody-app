import type { FormEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { LoginValues } from "@/services/validation-schemas/login";

export interface LoginFormModel {
  form: UseFormReturn<LoginValues>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  waitSeconds: number;
  registerPath: string;
}
