import { createBrowserRouter, type DataRouter, type RouteObject } from "react-router";
import { SplashScreen } from "@/components/splash-screen";
import { ROOT_ROUTE_ID } from "@/constants/routes";
import { adminRoute } from "@/pages/admin/admin.routes";
import { authRoute } from "@/pages/auth/auth.routes";
import { catalogRoute } from "@/pages/catalog/catalog.routes";
import { dashboardRoute } from "@/pages/dashboard/dashboard.routes";
import { errorsRoute } from "@/pages/errors/errors.routes";
import { ordersRoute } from "@/pages/orders/orders.routes";
import { storeRoute } from "@/pages/store/store.routes";
import type { AppStore } from "@/store";
import { guardRoutes, homeLoader, rootLoader, routerContextFor } from "./guards";
import { collectRoutedScreens, type RoutedScreens } from "./navigation";
import { RouteErrorBoundary } from "./route-error-boundary";

const AREA_ROUTES: RouteObject[] = [
  authRoute,
  storeRoute,
  dashboardRoute,
  ordersRoute,
  catalogRoute,
  adminRoute,
  errorsRoute,
];

export const ROUTED_SCREENS: RoutedScreens = collectRoutedScreens(AREA_ROUTES);

export const ROUTES: RouteObject[] = [
  {
    id: ROOT_ROUTE_ID,
    loader: rootLoader,
    HydrateFallback: SplashScreen,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, loader: homeLoader(ROUTED_SCREENS), Component: SplashScreen },
      ...guardRoutes(AREA_ROUTES, ROUTED_SCREENS),
    ],
  },
];

export function createAppRouter(store: AppStore): DataRouter {
  return createBrowserRouter(ROUTES, {
    getContext: (): ReturnType<typeof routerContextFor> => routerContextFor(store),
  });
}
