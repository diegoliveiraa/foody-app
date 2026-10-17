import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";

export const orderListRoute: RouteObject = {
  path: "orders",
  handle: screenHandle(SCREEN_KEYS.ORDERS_ORDER_LIST),
  lazy: {
    Component: async (): Promise<ComponentType> => (await import("./index")).OrderListScreen,
  },
};
