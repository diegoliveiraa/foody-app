import { ZIP_CODE_DIGITS, ZIP_CODE_PREFIX_DIGITS, ZIP_CODE_SEPARATOR } from "@/constants/orders";
import { EMPTY_TEXT } from "@/constants/validation";

const NON_DIGITS: RegExp = /\D/g;

const FIRST_DIGIT: number = 0;

export function maskZipCode(typed: string): string {
  const digits: string = typed.replace(NON_DIGITS, EMPTY_TEXT).slice(FIRST_DIGIT, ZIP_CODE_DIGITS);
  if (digits.length <= ZIP_CODE_PREFIX_DIGITS) {
    return digits;
  }
  return `${digits.slice(FIRST_DIGIT, ZIP_CODE_PREFIX_DIGITS)}${ZIP_CODE_SEPARATOR}${digits.slice(ZIP_CODE_PREFIX_DIGITS)}`;
}
