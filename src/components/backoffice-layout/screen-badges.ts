import { createElement, type ReactElement } from "react";
import { SCREEN_KEYS, type ScreenKey } from "@/constants/screens";
import { ActiveOrdersBadge } from "./active-orders-badge";

const SCREEN_BADGES: Partial<Record<ScreenKey, ReactElement>> = {
  [SCREEN_KEYS.ORDERS_ORDER_LIST]: createElement(ActiveOrdersBadge),
};

const SCREEN_KEY_LIST: readonly string[] = Object.values(SCREEN_KEYS);

function isScreenKey(key: string): key is ScreenKey {
  return SCREEN_KEY_LIST.includes(key);
}

export function screenBadgeFor(key: string): ReactElement | null {
  return isScreenKey(key) ? (SCREEN_BADGES[key] ?? null) : null;
}
