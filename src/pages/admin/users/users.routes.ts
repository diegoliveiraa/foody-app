import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";

export const usersRoute: RouteObject = {
  path: "admin/users",
  handle: screenHandle(SCREEN_KEYS.ADMIN_USERS),
  lazy: {
    Component: async (): Promise<ComponentType> => (await import("./index")).UsersScreen,
  },
};
