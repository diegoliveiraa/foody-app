import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";

export const categoriesRoute: RouteObject = {
  path: "catalog/categories",
  handle: screenHandle(SCREEN_KEYS.CATALOG_CATEGORIES),
  lazy: {
    Component: async (): Promise<ComponentType> => (await import("./index")).CategoriesScreen,
  },
};
