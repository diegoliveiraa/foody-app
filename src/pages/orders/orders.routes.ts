import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { MODULE_KEYS } from "@/constants/screens";
import { moduleHandle } from "@/routes/handles";
import { orderListRoute } from "./order-list/order-list.routes";

export const ordersRoute: RouteObject = {
  handle: moduleHandle(MODULE_KEYS.ORDERS),
  lazy: {
    Component: async (): Promise<ComponentType> =>
      (await import("@/components/backoffice-layout")).BackofficeLayout,
  },
  children: [orderListRoute],
};
