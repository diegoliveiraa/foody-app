import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";

export const menuRoute: RouteObject = {
  path: "menu",
  handle: screenHandle(SCREEN_KEYS.STORE_MENU),
  lazy: {
    Component: async (): Promise<ComponentType> => (await import("./index")).MenuScreen,
  },
};
