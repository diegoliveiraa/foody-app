import { useId, type JSX } from "react";
import {
  Controller,
  useWatch,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import type { CancellationReason } from "@/@types/orders";
import { TextareaField } from "@/components/textarea-field";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MESSAGES } from "@/constants/messages";
import { CANCELLATION_REASON_LABELS, CANCELLATION_REASONS } from "@/constants/orders";
import type {
  CancellationForm,
  CancellationFormInput,
} from "@/services/validation-schemas/cancellation";

interface CancellationReasonFieldsProps {
  form: CancellationForm;
  reasons: readonly CancellationReason[];
  legend: string;
}

interface ReasonGroupProps {
  field: ControllerRenderProps<CancellationFormInput, "reason">;
  fieldState: ControllerFieldState;
  reasons: readonly CancellationReason[];
  legend: string;
}

interface NoteFieldProps {
  form: CancellationForm;
  required: boolean;
}

function ReasonGroup({ field, fieldState, reasons, legend }: ReasonGroupProps): JSX.Element {
  const id: string = useId();
  const legendId: string = `${id}-legend`;
  const errorId: string = `${id}-error`;
  const invalid: boolean = fieldState.error !== undefined;

  return (
    <FieldSet data-invalid={invalid} className="gap-2">
      <FieldLegend id={legendId} variant="label" className="mb-1 font-semibold">
        {legend}
      </FieldLegend>
      <RadioGroup
        name={field.name}
        value={field.value}
        onValueChange={field.onChange}
        aria-labelledby={legendId}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        className="gap-2"
      >
        {reasons.map((reason: CancellationReason): JSX.Element => (
          <Label
            key={reason}
            htmlFor={`${id}-${reason}`}
            className="min-h-12 cursor-pointer gap-3 rounded-[14px] border-[1.5px] border-border bg-card px-3.5 py-2 text-[15px] leading-snug font-normal has-data-checked:border-primary has-data-checked:bg-attention"
          >
            <RadioGroupItem id={`${id}-${reason}`} value={reason} />
            {CANCELLATION_REASON_LABELS[reason]}
          </Label>
        ))}
      </RadioGroup>
      <FieldError id={errorId}>{fieldState.error?.message}</FieldError>
    </FieldSet>
  );
}

function NoteField({ form, required }: NoteFieldProps): JSX.Element {
  return (
    <TextareaField
      label={required ? MESSAGES.CANCELLATION.NOTE_REQUIRED : MESSAGES.CANCELLATION.NOTE}
      placeholder={MESSAGES.CANCELLATION.NOTE_PLACEHOLDER}
      aria-required={required}
      error={form.formState.errors.note?.message}
      {...form.register("note")}
    />
  );
}

export function CancellationReasonFields({
  form,
  reasons,
  legend,
}: CancellationReasonFieldsProps): JSX.Element {
  const reason: string = useWatch({ control: form.control, name: "reason" });

  return (
    <>
      <Controller
        control={form.control}
        name="reason"
        render={({ field, fieldState }): JSX.Element => (
          <ReasonGroup field={field} fieldState={fieldState} reasons={reasons} legend={legend} />
        )}
      />
      <NoteField form={form} required={reason === CANCELLATION_REASONS.OTHER} />
    </>
  );
}
