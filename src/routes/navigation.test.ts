import { Package, Receipt, Utensils } from "lucide-react";
import type { RouteObject } from "react-router";
import { describe, expect, it } from "vitest";
import type { MeModule } from "@/@types/me";
import { MODULE_KEYS, SCREEN_KEYS } from "@/constants/screens";
import { moduleHandle, PUBLIC_HANDLE, screenHandle } from "./handles";
import {
  buildNavigation,
  collectRoutedScreens,
  firstScreenPath,
  type RoutedScreens,
} from "./navigation";
import type { NavigationModule } from "./types";

const ROUTES: RouteObject[] = [
  {
    id: "root",
    children: [
      { index: true },
      { path: "login", handle: PUBLIC_HANDLE },
      {
        handle: moduleHandle(MODULE_KEYS.STORE),
        children: [
          { path: "menu", handle: screenHandle(SCREEN_KEYS.STORE_MENU) },
          { path: "my-orders", handle: screenHandle(SCREEN_KEYS.STORE_MY_ORDERS) },
        ],
      },
      {
        path: "catalog",
        handle: moduleHandle(MODULE_KEYS.CATALOG),
        children: [{ path: "products", handle: screenHandle(SCREEN_KEYS.CATALOG_PRODUCTS) }],
      },
    ],
  },
];

const STORE_MODULE: MeModule = {
  key: "store",
  label: "Loja",
  screens: [
    { key: "store.my-orders", label: "Pedidos", actions: [] },
    { key: "store.menu", label: "Cardápio", actions: ["PLACE_ORDER"] },
  ],
};

const CATALOG_MODULE: MeModule = {
  key: "catalog",
  label: "Catálogo",
  screens: [
    { key: "catalog.products", label: "Produtos", actions: [] },
    { key: "catalog.categories", label: "Categorias", actions: [] },
  ],
};

const UNKNOWN_MODULE: MeModule = {
  key: "reports",
  label: "Relatórios",
  screens: [{ key: "reports.sales", label: "Vendas", actions: [] }],
};

describe("navigation from /me", () => {
  it("derives each screen's path and icon from the route table, nested paths included", () => {
    const screens: RoutedScreens = collectRoutedScreens(ROUTES);

    expect(Object.fromEntries(screens)).toEqual({
      "store.menu": { path: "/menu", icon: Utensils },
      "store.my-orders": { path: "/my-orders", icon: Receipt },
      "catalog.products": { path: "/catalog/products", icon: Package },
    });
  });

  it("lists the screens of /me in the API's order and with the API's labels", () => {
    const navigation: NavigationModule[] = buildNavigation(
      [STORE_MODULE],
      collectRoutedScreens(ROUTES),
    );

    expect(navigation).toEqual([
      {
        key: "store",
        label: "Loja",
        items: [
          { key: "store.my-orders", label: "Pedidos", path: "/my-orders", icon: Receipt },
          { key: "store.menu", label: "Cardápio", path: "/menu", icon: Utensils },
        ],
      },
    ]);
  });

  it("skips screens that have no route in the app", () => {
    const navigation: NavigationModule[] = buildNavigation(
      [CATALOG_MODULE],
      collectRoutedScreens(ROUTES),
    );

    expect(navigation[0]?.items.map(({ key }: { key: string }): string => key)).toEqual([
      "catalog.products",
    ]);
  });

  it("drops a module none of whose screens has a route", () => {
    const navigation: NavigationModule[] = buildNavigation(
      [UNKNOWN_MODULE, STORE_MODULE],
      collectRoutedScreens(ROUTES),
    );

    expect(navigation.map(({ key }: NavigationModule): string => key)).toEqual(["store"]);
  });

  it("takes the first routed screen of the first module as the home page", () => {
    const home: string | null = firstScreenPath(
      [UNKNOWN_MODULE, CATALOG_MODULE, STORE_MODULE],
      collectRoutedScreens(ROUTES),
    );

    expect(home).toBe("/catalog/products");
  });

  it("has no home page when /me offers no routed screen", () => {
    const home: string | null = firstScreenPath([UNKNOWN_MODULE], collectRoutedScreens(ROUTES));

    expect(home).toBeNull();
  });
});
