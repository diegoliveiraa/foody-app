import type { FormEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { RegisterValues } from "@/services/validation-schemas/register";

export interface RegisterFormModel {
  form: UseFormReturn<RegisterValues>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}
