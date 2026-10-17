import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { MODULE_KEYS } from "@/constants/screens";
import { moduleHandle } from "@/routes/handles";
import { productsRoute } from "./products/products.routes";
import { categoriesRoute } from "./categories/categories.routes";

export const catalogRoute: RouteObject = {
  handle: moduleHandle(MODULE_KEYS.CATALOG),
  lazy: {
    Component: async (): Promise<ComponentType> =>
      (await import("@/components/backoffice-layout")).BackofficeLayout,
  },
  children: [productsRoute, categoriesRoute],
};
