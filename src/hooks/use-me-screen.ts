import type { MeModule, MeScreen } from "@/@types/me";
import type { ScreenKey } from "@/constants/screens";
import { useMe } from "./use-me";

export function useMeScreen(screenKey: ScreenKey): MeScreen | undefined {
  return useMe()
    ?.modules.flatMap((module: MeModule): MeScreen[] => module.screens)
    .find((screen: MeScreen): boolean => screen.key === screenKey);
}
