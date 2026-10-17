import { useId, type ComponentProps, type JSX, type ReactNode } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type TextareaFieldProps = ComponentProps<typeof Textarea> & {
  label: ReactNode;
  error?: string;
};

export function TextareaField({ label, error, ...textareaProps }: TextareaFieldProps): JSX.Element {
  const id: string = useId();
  const errorId: string = `${id}-error`;

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        rows={3}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="min-h-20 resize-none"
        {...textareaProps}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
