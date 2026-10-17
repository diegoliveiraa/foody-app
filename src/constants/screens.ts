import type { ScreenAction } from "@/@types/me";
import {
  LayoutDashboard,
  Package,
  Receipt,
  ShieldCheck,
  Store,
  Tags,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export const MODULE_KEYS = {
  STORE: "store",
  DASHBOARD: "dashboard",
  ORDERS: "orders",
  CATALOG: "catalog",
  ADMIN: "admin",
} as const;

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS];

export const SCREEN_KEYS = {
  STORE_MENU: "store.menu",
  STORE_MY_ORDERS: "store.my-orders",
  DASHBOARD_OVERVIEW: "dashboard.overview",
  ORDERS_ORDER_LIST: "orders.order-list",
  CATALOG_PRODUCTS: "catalog.products",
  CATALOG_CATEGORIES: "catalog.categories",
  ADMIN_USERS: "admin.users",
} as const;

export type ScreenKey = (typeof SCREEN_KEYS)[keyof typeof SCREEN_KEYS];

export const MODULE_ICONS: Record<ModuleKey, LucideIcon> = {
  [MODULE_KEYS.STORE]: Store,
  [MODULE_KEYS.DASHBOARD]: LayoutDashboard,
  [MODULE_KEYS.ORDERS]: Receipt,
  [MODULE_KEYS.CATALOG]: Package,
  [MODULE_KEYS.ADMIN]: ShieldCheck,
};

export const SCREEN_ICONS: Record<ScreenKey, LucideIcon> = {
  [SCREEN_KEYS.STORE_MENU]: Utensils,
  [SCREEN_KEYS.STORE_MY_ORDERS]: Receipt,
  [SCREEN_KEYS.DASHBOARD_OVERVIEW]: LayoutDashboard,
  [SCREEN_KEYS.ORDERS_ORDER_LIST]: Receipt,
  [SCREEN_KEYS.CATALOG_PRODUCTS]: Package,
  [SCREEN_KEYS.CATALOG_CATEGORIES]: Tags,
  [SCREEN_KEYS.ADMIN_USERS]: Users,
};

export const SCREEN_ACTIONS = {
  PLACE_ORDER: "PLACE_ORDER",
  CANCEL: "CANCEL",
  REQUEST_CANCELLATION: "REQUEST_CANCELLATION",
  UPDATE_STATUS: "UPDATE_STATUS",
  DECIDE_CANCELLATION: "DECIDE_CANCELLATION",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DISABLE: "DISABLE",
  DELETE: "DELETE",
} as const satisfies Record<ScreenAction, ScreenAction>;
