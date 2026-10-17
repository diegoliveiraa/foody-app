import { useCallback, useState, useSyncExternalStore } from "react";

type Unsubscribe = () => void;

interface SettledValue<T> {
  read: () => T;
  settle: (value: T) => void;
}

function createSettledValue<T>(initial: T): SettledValue<T> {
  let settled: T = initial;
  return {
    read: (): T => settled,
    settle: (value: T): void => {
      settled = value;
    },
  };
}

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [settled] = useState<SettledValue<T>>((): SettledValue<T> => createSettledValue(value));
  const subscribe = useCallback(
    (onSettle: () => void): Unsubscribe => {
      const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
        settled.settle(value);
        onSettle();
      }, delayMs);
      return (): void => clearTimeout(timer);
    },
    [settled, value, delayMs],
  );
  return useSyncExternalStore(subscribe, settled.read);
}
