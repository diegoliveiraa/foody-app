import type { ProblemDetails, ProblemFieldError } from "@/@types/problem-details";
import { MESSAGES } from "@/constants/messages";

export interface ApiErrorInfo {
  detail: string;
  code: string | null;
  requestId: string | null;
  fieldErrors: Record<string, string>;
  retryAfterSeconds: number | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return isRecord(value) && typeof value.detail === "string" && typeof value.code === "string";
}

function readRetryAfter(error: unknown): number | null {
  if (!isRecord(error) || typeof error.retryAfterSeconds !== "number") {
    return null;
  }
  return error.retryAfterSeconds;
}

function toFieldErrors(errors: ProblemFieldError[]): Record<string, string> {
  return errors.reduce(
    (
      fields: Record<string, string>,
      { field, message }: ProblemFieldError,
    ): Record<string, string> => (field in fields ? fields : { ...fields, [field]: message }),
    {},
  );
}

export function extractApiError(error: unknown): ApiErrorInfo {
  const retryAfterSeconds: number | null = readRetryAfter(error);
  const problem: unknown = isRecord(error) ? error.data : undefined;
  if (!isProblemDetails(problem)) {
    return {
      detail: MESSAGES.ERRORS.UNAVAILABLE,
      code: null,
      requestId: null,
      fieldErrors: {},
      retryAfterSeconds,
    };
  }
  return {
    detail: problem.detail,
    code: problem.code,
    requestId: problem.requestId ?? null,
    fieldErrors: toFieldErrors(problem.errors ?? []),
    retryAfterSeconds,
  };
}
