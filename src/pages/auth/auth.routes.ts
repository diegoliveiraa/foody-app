import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { loginRoute } from "./login/login.routes";
import { registerRoute } from "./register/register.routes";

export const authRoute: RouteObject = {
  lazy: {
    Component: async (): Promise<ComponentType> =>
      (await import("@/components/auth-layout")).AuthLayout,
  },
  children: [loginRoute, registerRoute],
};
