import { DASHBOARD_MESSAGES } from "../constants/messages";

export function isKnown(value: number | null | undefined): value is number {
  return value !== null && value !== undefined;
}

export function orDash(
  value: number | null | undefined,
  format: (value: number) => string,
): string {
  return isKnown(value) ? format(value) : DASHBOARD_MESSAGES.NOT_AVAILABLE;
}
