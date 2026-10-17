import { useMemo } from "react";
import { MODULE_KEYS } from "@/constants/screens";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
import type { NavigationItem, NavigationModule } from "@/routes/types";

export function useStoreTabs(): NavigationItem[] {
  const navigation: NavigationModule[] = useNavigationMenu();
  return useMemo(
    (): NavigationItem[] =>
      navigation.find((module: NavigationModule): boolean => module.key === MODULE_KEYS.STORE)
        ?.items ?? [],
    [navigation],
  );
}
