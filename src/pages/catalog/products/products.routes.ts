import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { SCREEN_KEYS } from "@/constants/screens";
import { screenHandle } from "@/routes/handles";

export const productsRoute: RouteObject = {
  path: "catalog/products",
  handle: screenHandle(SCREEN_KEYS.CATALOG_PRODUCTS),
  lazy: {
    Component: async (): Promise<ComponentType> => (await import("./index")).ProductsScreen,
  },
};
