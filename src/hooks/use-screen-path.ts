import { useMemo } from "react";
import { ROUTE_PATHS } from "@/constants/routes";
import type { ScreenKey } from "@/constants/screens";
import { ROUTED_SCREENS } from "@/routes";

export function useScreenPath(screenKey: ScreenKey): string {
  return useMemo(
    (): string => ROUTED_SCREENS.get(screenKey)?.path ?? ROUTE_PATHS.HOME,
    [screenKey],
  );
}
