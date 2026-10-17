import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { ID_SEGMENT } from "@/constants/routes";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";

export const myOrdersRoute: RouteObject = {
  path: "my-orders",
  handle: screenHandle(SCREEN_KEYS.STORE_MY_ORDERS),
  children: [
    {
      index: true,
      lazy: {
        Component: async (): Promise<ComponentType> => (await import("./list")).MyOrdersScreen,
      },
    },
    {
      path: ID_SEGMENT,
      lazy: {
        Component: async (): Promise<ComponentType> => (await import("./detail")).MyOrderScreen,
      },
    },
  ],
};
