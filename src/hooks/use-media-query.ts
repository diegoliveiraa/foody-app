import { useCallback, useSyncExternalStore } from "react";

type Unsubscribe = () => void;

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void): Unsubscribe => {
      const list: MediaQueryList = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return (): void => list.removeEventListener("change", onChange);
    },
    [query],
  );
  const readMatch = useCallback((): boolean => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, readMatch);
}
