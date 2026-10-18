import { WEEKDAY_SHORT_LABELS } from "@/constants/dates";
import { APP_LOCALE } from "@/constants/locale";
import { MESSAGES } from "@/constants/messages";

const CLOCK_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
};

const HOUR_OPTIONS: Intl.DateTimeFormatOptions = { hour: "numeric", hourCycle: "h23" };

const DAY_MONTH_OPTIONS: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" };

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

const FIRST_MONTH: number = 1;

function formatterIn(timeZone: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(APP_LOCALE, { ...options, timeZone });
}

function partOf(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  return Number(parts.find((part: Intl.DateTimeFormatPart): boolean => part.type === type)?.value);
}

export function formatZonedClock(instant: string, timeZone: string): string {
  return formatterIn(timeZone, CLOCK_OPTIONS).format(new Date(instant));
}

export function formatZonedHour(instant: string, timeZone: string): string {
  const hour: number = Number(formatterIn(timeZone, HOUR_OPTIONS).format(new Date(instant)));
  return MESSAGES.DATES.HOUR(hour);
}

export function formatZonedDayMonth(instant: string, timeZone: string): string {
  return formatterIn(timeZone, DAY_MONTH_OPTIONS).format(new Date(instant));
}

export function formatZonedWeekday(instant: string, timeZone: string): string {
  const parts: Intl.DateTimeFormatPart[] = formatterIn(timeZone, DATE_OPTIONS).formatToParts(
    new Date(instant),
  );
  const localDay: Date = new Date(
    Date.UTC(partOf(parts, "year"), partOf(parts, "month") - FIRST_MONTH, partOf(parts, "day")),
  );
  return WEEKDAY_SHORT_LABELS[localDay.getUTCDay()];
}
