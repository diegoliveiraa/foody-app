import { useCallback } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ERROR_CODES } from "@/constants/api";
import { extractApiError, knownFieldErrors, type ApiErrorInfo } from "@/utils/api-error";

type FieldMessage<TValues extends FieldValues> = [Path<TValues>, string];

function fieldMessagesOf<TValues extends FieldValues>(
  info: ApiErrorInfo,
  fields: readonly Path<TValues>[],
  codeFields: Readonly<Partial<Record<string, Path<TValues>>>>,
): FieldMessage<TValues>[] {
  const codeField: Path<TValues> | undefined =
    info.code === null ? undefined : codeFields[info.code];
  if (codeField !== undefined) {
    return [[codeField, info.detail]];
  }
  return knownFieldErrors(info, fields);
}

export function useFormApiErrors<TValues extends FieldValues>(
  setError: UseFormSetError<TValues>,
  fields: readonly Path<TValues>[],
  codeFields: Readonly<Partial<Record<string, Path<TValues>>>>,
): (error: unknown) => void {
  return useCallback(
    (error: unknown): void => {
      const info: ApiErrorInfo = extractApiError(error);
      if (info.code === ERROR_CODES.RATE_LIMITED) {
        return;
      }
      const fieldMessages: FieldMessage<TValues>[] = fieldMessagesOf(info, fields, codeFields);
      if (fieldMessages.length === 0) {
        setError("root", { message: info.detail });
        return;
      }
      fieldMessages.forEach(([field, message]: FieldMessage<TValues>): void =>
        setError(field, { message }),
      );
    },
    [setError, fields, codeFields],
  );
}
