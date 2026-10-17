import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";

export const overviewRoute: RouteObject = {
  path: "dashboard",
  handle: screenHandle(SCREEN_KEYS.DASHBOARD_OVERVIEW),
  lazy: {
    Component: async (): Promise<ComponentType> => (await import("./index")).OverviewScreen,
  },
};
