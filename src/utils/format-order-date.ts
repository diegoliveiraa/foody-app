import { differenceInMinutes, format, isSameDay, isSameYear, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DATE_FORMAT, DAY_MONTH_FORMAT, DAYS_BEFORE_TODAY, TIME_FORMAT } from "@/constants/dates";
import { MESSAGES } from "@/constants/messages";
import { MINUTES_PER_HOUR, MS_PER_SECOND, SECONDS_PER_MINUTE } from "@/constants/time";

const NO_TIME: number = 0;

function formatWith(date: Date, pattern: string): string {
  return format(date, pattern, { locale: ptBR });
}

export function formatClock(instant: string): string {
  return formatWith(new Date(instant), TIME_FORMAT);
}

export function formatOrderTime(instant: string, now: number): string {
  const placed: Date = new Date(instant);
  const time: string = formatWith(placed, TIME_FORMAT);
  if (isSameDay(placed, now)) {
    return MESSAGES.DATES.TODAY(time);
  }
  if (isSameDay(placed, subDays(now, DAYS_BEFORE_TODAY))) {
    return MESSAGES.DATES.YESTERDAY(time);
  }
  const dayPattern: string = isSameYear(placed, now) ? DAY_MONTH_FORMAT : DATE_FORMAT;
  return MESSAGES.DATES.DAY(formatWith(placed, dayPattern), time);
}

export function formatOrderAge(instant: string, now: number): string {
  const minutes: number = Math.max(NO_TIME, differenceInMinutes(now, new Date(instant)));
  if (minutes === NO_TIME) {
    return MESSAGES.DATES.AGE_NOW;
  }
  if (minutes < MINUTES_PER_HOUR) {
    return MESSAGES.DATES.AGE_MINUTES(minutes);
  }
  return MESSAGES.DATES.AGE_HOURS(
    Math.floor(minutes / MINUTES_PER_HOUR),
    minutes % MINUTES_PER_HOUR,
  );
}

export function formatUpdatedAgo(updatedAt: number, now: number): string {
  const seconds: number = Math.max(NO_TIME, Math.floor((now - updatedAt) / MS_PER_SECOND));
  if (seconds < SECONDS_PER_MINUTE) {
    return MESSAGES.DATES.UPDATED_SECONDS_AGO(seconds);
  }
  return MESSAGES.DATES.UPDATED_MINUTES_AGO(Math.floor(seconds / SECONDS_PER_MINUTE));
}
