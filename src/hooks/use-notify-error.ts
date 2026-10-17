import { toast } from "sonner";
import { ERROR_CODES } from "@/constants/api";
import { extractApiError, type ApiErrorInfo } from "@/utils/api-error";

function notifyError(error: unknown): void {
  const info: ApiErrorInfo = extractApiError(error);
  if (info.code === ERROR_CODES.RATE_LIMITED) {
    return;
  }
  toast.error(info.detail);
}

export function useNotifyError(): (error: unknown) => void {
  return notifyError;
}
