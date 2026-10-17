import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { MODULE_KEYS } from "@/constants/screens";
import { moduleHandle } from "@/routes/handles";
import { menuRoute } from "./menu/menu.routes";
import { myOrdersRoute } from "./my-orders/my-orders.routes";

export const storeRoute: RouteObject = {
  handle: moduleHandle(MODULE_KEYS.STORE),
  lazy: {
    Component: async (): Promise<ComponentType> =>
      (await import("@/components/store-layout")).StoreLayout,
  },
  children: [menuRoute, myOrdersRoute],
};
