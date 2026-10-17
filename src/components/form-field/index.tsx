import { useId, type ComponentProps, type JSX } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormFieldProps = ComponentProps<typeof Input> & {
  label: string;
  error?: string;
};

export function FormField({ label, error, ...inputProps }: FormFieldProps): JSX.Element {
  const id: string = useId();
  const errorId: string = `${id}-error`;

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
