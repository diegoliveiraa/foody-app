import { APP_LOCALE, PERCENT_FRACTION_DIGITS } from "@/constants/locale";
import { MESSAGES } from "@/constants/messages";

const COUNT: Intl.NumberFormat = new Intl.NumberFormat(APP_LOCALE);

const PERCENT: Intl.NumberFormat = new Intl.NumberFormat(APP_LOCALE, {
  style: "unit",
  unit: "percent",
  minimumFractionDigits: PERCENT_FRACTION_DIGITS,
  maximumFractionDigits: PERCENT_FRACTION_DIGITS,
});

const PERCENT_CHANGE: Intl.NumberFormat = new Intl.NumberFormat(APP_LOCALE, {
  style: "unit",
  unit: "percent",
  maximumFractionDigits: PERCENT_FRACTION_DIGITS,
  signDisplay: "exceptZero",
});

export function formatCount(count: number): string {
  return COUNT.format(count);
}

export function formatPercent(percent: number): string {
  return PERCENT.format(percent);
}

export function formatPercentChange(percent: number): string {
  return PERCENT_CHANGE.format(percent);
}

export function formatMinutes(minutes: number): string {
  return MESSAGES.DATES.MINUTES(formatCount(minutes));
}
