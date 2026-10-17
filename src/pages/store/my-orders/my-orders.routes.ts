import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";

export const myOrdersRoute: RouteObject = {
  path: "my-orders",
  handle: screenHandle(SCREEN_KEYS.STORE_MY_ORDERS),
  lazy: {
    Component: async (): Promise<ComponentType> => (await import("./index")).MyOrdersScreen,
  },
};
