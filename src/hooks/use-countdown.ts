import { useCallback, useSyncExternalStore } from "react";
import { MS_PER_SECOND } from "@/constants/time";

type Unsubscribe = () => void;

const TICK_MS: number = MS_PER_SECOND;

function subscribeToTicks(onTick: () => void): Unsubscribe {
  const timer: ReturnType<typeof setInterval> = setInterval(onTick, TICK_MS);
  return (): void => clearInterval(timer);
}

function subscribeToNothing(): Unsubscribe {
  return (): void => {};
}

function secondsUntil(until: number | null): number {
  if (until === null) {
    return 0;
  }
  return Math.max(0, Math.ceil((until - Date.now()) / MS_PER_SECOND));
}

export function useCountdown(until: number | null): number {
  const readSeconds = useCallback((): number => secondsUntil(until), [until]);
  return useSyncExternalStore(until === null ? subscribeToNothing : subscribeToTicks, readSeconds);
}
