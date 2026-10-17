import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";
import { CHECKOUT_SEGMENT } from "./constants";

export const menuRoute: RouteObject = {
  path: "menu",
  handle: screenHandle(SCREEN_KEYS.STORE_MENU),
  children: [
    {
      index: true,
      lazy: {
        Component: async (): Promise<ComponentType> => (await import("./list")).MenuScreen,
      },
    },
    {
      path: CHECKOUT_SEGMENT,
      lazy: {
        Component: async (): Promise<ComponentType> => (await import("./checkout")).CheckoutScreen,
      },
    },
  ],
};
