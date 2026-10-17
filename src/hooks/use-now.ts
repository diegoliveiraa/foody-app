import { useCallback, useSyncExternalStore } from "react";
import { MS_PER_SECOND } from "@/constants/time";

type Unsubscribe = () => void;

export function useNow(tickMs: number = MS_PER_SECOND): number {
  const subscribe = useCallback(
    (onTick: () => void): Unsubscribe => {
      const timer: ReturnType<typeof setInterval> = setInterval(onTick, tickMs);
      return (): void => clearInterval(timer);
    },
    [tickMs],
  );
  const readNow = useCallback((): number => Math.floor(Date.now() / tickMs) * tickMs, [tickMs]);
  return useSyncExternalStore(subscribe, readNow);
}
