import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { ROUTE_PATHS } from "@/constants/routes";
import { PUBLIC_HANDLE } from "@/routes/handles";

export const registerRoute: RouteObject = {
  path: ROUTE_PATHS.REGISTER,
  handle: PUBLIC_HANDLE,
  lazy: {
    Component: async (): Promise<ComponentType> => (await import("./index")).RegisterScreen,
  },
};
