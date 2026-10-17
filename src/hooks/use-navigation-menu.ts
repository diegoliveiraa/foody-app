import { useMemo } from "react";
import type { MeResponse } from "@/@types/me";
import { ROUTED_SCREENS } from "@/routes";
import { buildNavigation } from "@/routes/navigation";
import type { NavigationModule } from "@/routes/types";
import { useMe } from "./use-me";

export function useNavigationMenu(): NavigationModule[] {
  const me: MeResponse | undefined = useMe();
  return useMemo(
    (): NavigationModule[] => buildNavigation(me?.modules ?? [], ROUTED_SCREENS),
    [me],
  );
}
