import { MODULE_ICONS, SCREEN_ICONS, type ModuleKey, type ScreenKey } from "@/constants/screens";
import type { ModuleHandle, PublicHandle, ScreenHandle } from "./types";

export const PUBLIC_HANDLE: PublicHandle = { public: true };

export function screenHandle(screenKey: ScreenKey): ScreenHandle {
  return { screenKey, icon: SCREEN_ICONS[screenKey] };
}

export function moduleHandle(moduleKey: ModuleKey): ModuleHandle {
  return { moduleKey, icon: MODULE_ICONS[moduleKey] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isScreenHandle(handle: unknown): handle is ScreenHandle {
  return isRecord(handle) && typeof handle.screenKey === "string";
}

export function isPublicHandle(handle: unknown): handle is PublicHandle {
  return isRecord(handle) && handle.public === true;
}
