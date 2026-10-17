import { STALE_ORDER_CODES } from "@/constants/api";
import { extractApiError, type ApiErrorInfo } from "./api-error";

export function isStaleOrderError(error: unknown): boolean {
  const { code }: ApiErrorInfo = extractApiError(error);
  return code !== null && STALE_ORDER_CODES.has(code);
}
