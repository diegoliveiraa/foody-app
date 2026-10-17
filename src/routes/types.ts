import type { LucideIcon } from "lucide-react";
import type { ModuleKey, ScreenKey } from "@/constants/screens";

export interface ScreenHandle {
  screenKey: ScreenKey;
  icon: LucideIcon;
}

export interface ModuleHandle {
  moduleKey: ModuleKey;
  icon: LucideIcon;
}

export interface PublicHandle {
  public: true;
}

export interface RoutedScreen {
  path: string;
  icon: LucideIcon;
}

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavigationModule {
  key: string;
  label: string;
  items: NavigationItem[];
}
