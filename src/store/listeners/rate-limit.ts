import { isRejectedWithValue, type UnknownAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { ERROR_CODES } from "@/constants/api";
import { MESSAGES } from "@/constants/messages";
import { TOAST_IDS } from "@/constants/toasts";
import type { AppStartListening } from "@/store";
import { extractApiError, type ApiErrorInfo } from "@/utils/api-error";

function rateLimitOf(action: UnknownAction): ApiErrorInfo | null {
  if (!isRejectedWithValue(action)) {
    return null;
  }
  const error: ApiErrorInfo = extractApiError(action.payload);
  return error.code === ERROR_CODES.RATE_LIMITED ? error : null;
}

function waitMessage({ detail, retryAfterSeconds }: ApiErrorInfo): string {
  return retryAfterSeconds === null ? detail : MESSAGES.ERRORS.RATE_LIMITED(retryAfterSeconds);
}

export function listenForRateLimits(startListening: AppStartListening): void {
  startListening({
    predicate: (action: UnknownAction): boolean => rateLimitOf(action) !== null,
    effect: (action: UnknownAction): void => {
      const error: ApiErrorInfo | null = rateLimitOf(action);
      if (error === null) {
        return;
      }
      toast(waitMessage(error), { id: TOAST_IDS.RATE_LIMITED });
    },
  });
}
