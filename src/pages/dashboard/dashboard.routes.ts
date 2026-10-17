import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { MODULE_KEYS } from "@/constants/screens";
import { moduleHandle } from "@/routes/handles";
import { overviewRoute } from "./overview/overview.routes";

export const dashboardRoute: RouteObject = {
  handle: moduleHandle(MODULE_KEYS.DASHBOARD),
  lazy: {
    Component: async (): Promise<ComponentType> =>
      (await import("@/components/backoffice-layout")).BackofficeLayout,
  },
  children: [overviewRoute],
};
