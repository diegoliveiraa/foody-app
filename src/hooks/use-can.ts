import type { MeScreen, ScreenAction } from "@/@types/me";
import type { ScreenKey } from "@/constants/screens";
import { useMeScreen } from "./use-me-screen";

export function useCan(screenKey: ScreenKey, action: ScreenAction): boolean {
  const screen: MeScreen | undefined = useMeScreen(screenKey);
  return screen?.actions.includes(action) ?? false;
}
