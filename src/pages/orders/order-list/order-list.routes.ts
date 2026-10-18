import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { HISTORY_SEGMENT, ID_SEGMENT } from "@/constants/routes";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";

export const orderListRoute: RouteObject = {
  path: "orders",
  handle: screenHandle(SCREEN_KEYS.ORDERS_ORDER_LIST),
  children: [
    {
      index: true,
      lazy: {
        Component: async (): Promise<ComponentType> => (await import("./board")).OrderBoardScreen,
      },
    },
    {
      path: HISTORY_SEGMENT,
      lazy: {
        Component: async (): Promise<ComponentType> =>
          (await import("./history")).OrderHistoryScreen,
      },
    },
    {
      path: ID_SEGMENT,
      lazy: {
        Component: async (): Promise<ComponentType> => (await import("./detail")).OrderDetailScreen,
      },
    },
  ],
};
