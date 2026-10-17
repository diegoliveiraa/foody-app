import { APP_LOCALE, CURRENCY_CODE, MONEY_FRACTION_DIGITS } from "@/constants/locale";

const MONEY: Intl.NumberFormat = new Intl.NumberFormat(APP_LOCALE, {
  style: "currency",
  currency: CURRENCY_CODE,
});

const DECIMAL_INPUT: Intl.NumberFormat = new Intl.NumberFormat(APP_LOCALE, {
  minimumFractionDigits: MONEY_FRACTION_DIGITS,
  maximumFractionDigits: MONEY_FRACTION_DIGITS,
  useGrouping: false,
});

export function formatMoney(amount: number): string {
  return MONEY.format(amount);
}

export function formatDecimalInput(amount: number): string {
  return DECIMAL_INPUT.format(amount);
}
