import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { MODULE_KEYS } from "@/constants/screens";
import { moduleHandle } from "@/routes/handles";
import { usersRoute } from "./users/users.routes";

export const adminRoute: RouteObject = {
  handle: moduleHandle(MODULE_KEYS.ADMIN),
  lazy: {
    Component: async (): Promise<ComponentType> =>
      (await import("@/components/backoffice-layout")).BackofficeLayout,
  },
  children: [usersRoute],
};
