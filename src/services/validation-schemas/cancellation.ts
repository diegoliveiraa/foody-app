import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import type { CancellationReason } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";
import {
  CANCELLATION_NOTE_MAX_LENGTH,
  CANCELLATION_REASON_LIST,
  CANCELLATION_REASONS,
} from "@/constants/orders";
import { EMPTY_TEXT } from "@/constants/validation";

const NOTE_FIELD = "note" as const;

const REASON_FIELD = "reason" as const;

const CUSTOM_ISSUE = "custom" as const;

function toNote(note: string): string | undefined {
  return note === EMPTY_TEXT ? undefined : note;
}

const noteField = z
  .string()
  .trim()
  .max(CANCELLATION_NOTE_MAX_LENGTH, { error: MESSAGES.VALIDATION.CANCELLATION_NOTE_TOO_LONG })
  .transform(toNote);

const cancellationBase = z.object({
  [REASON_FIELD]: z
    .string()
    .pipe(
      z.enum(CANCELLATION_REASON_LIST, { error: MESSAGES.VALIDATION.CANCELLATION_REASON_REQUIRED }),
    ),
  [NOTE_FIELD]: noteField,
});

export const decisionSchema = z.object({ [NOTE_FIELD]: noteField });

export type CancellationFormInput = z.input<typeof cancellationBase>;

export type CancellationFormValues = z.output<typeof cancellationBase>;

export type CancellationField = keyof CancellationFormInput;

export type CancellationSchema = z.ZodType<CancellationFormValues, CancellationFormInput>;

export type CancellationForm = UseFormReturn<
  CancellationFormInput,
  unknown,
  CancellationFormValues
>;

export type DecisionFormInput = z.input<typeof decisionSchema>;

export type DecisionFormValues = z.output<typeof decisionSchema>;

export type DecisionField = keyof DecisionFormInput;

export type DecisionForm = UseFormReturn<DecisionFormInput, unknown, DecisionFormValues>;

export const CANCELLATION_FIELDS: readonly CancellationField[] = cancellationBase.keyof().options;

export const DECISION_FIELDS: readonly DecisionField[] = decisionSchema.keyof().options;

export function cancellationSchema(reasons: readonly CancellationReason[]): CancellationSchema {
  return cancellationBase.superRefine(
    ({ reason, note }: CancellationFormValues, context: z.RefinementCtx): void => {
      if (!reasons.includes(reason)) {
        context.addIssue({
          code: CUSTOM_ISSUE,
          path: [REASON_FIELD],
          message: MESSAGES.VALIDATION.CANCELLATION_REASON_REQUIRED,
        });
        return;
      }
      if (reason === CANCELLATION_REASONS.OTHER && note === undefined) {
        context.addIssue({
          code: CUSTOM_ISSUE,
          path: [NOTE_FIELD],
          message: MESSAGES.VALIDATION.CANCELLATION_NOTE_REQUIRED,
        });
      }
    },
  );
}
