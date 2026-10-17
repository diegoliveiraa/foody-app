import type { RouteObject } from "react-router";
import type { MeModule, MeScreen } from "@/@types/me";
import { EMPTY_PATH, PATH_SEPARATOR } from "@/constants/routes";
import { isScreenHandle } from "./handles";
import type { NavigationItem, NavigationModule, RoutedScreen } from "./types";

export type RoutedScreens = ReadonlyMap<string, RoutedScreen>;

function withoutTrailingSeparator(path: string): string {
  return path.endsWith(PATH_SEPARATOR) ? path.slice(0, -PATH_SEPARATOR.length) : path;
}

export function joinPath(parentPath: string, path: string | undefined): string {
  if (path === undefined) {
    return parentPath;
  }
  if (path.startsWith(PATH_SEPARATOR)) {
    return path;
  }
  return `${withoutTrailingSeparator(parentPath)}${PATH_SEPARATOR}${path}`;
}

function routedScreensOf(route: RouteObject, parentPath: string): [string, RoutedScreen][] {
  const path: string = joinPath(parentPath, route.path);
  const own: [string, RoutedScreen][] = isScreenHandle(route.handle)
    ? [[route.handle.screenKey, { path: path || PATH_SEPARATOR, icon: route.handle.icon }]]
    : [];
  const children: [string, RoutedScreen][] = (route.children ?? []).flatMap(
    (child: RouteObject): [string, RoutedScreen][] => routedScreensOf(child, path),
  );
  return [...own, ...children];
}

export function collectRoutedScreens(routes: RouteObject[]): RoutedScreens {
  return new Map<string, RoutedScreen>(
    routes.flatMap((route: RouteObject): [string, RoutedScreen][] =>
      routedScreensOf(route, EMPTY_PATH),
    ),
  );
}

function toItems(module: MeModule, screens: RoutedScreens): NavigationItem[] {
  return module.screens.flatMap((screen: MeScreen): NavigationItem[] => {
    const routed: RoutedScreen | undefined = screens.get(screen.key);
    return routed ? [{ key: screen.key, label: screen.label, ...routed }] : [];
  });
}

export function buildNavigation(modules: MeModule[], screens: RoutedScreens): NavigationModule[] {
  return modules.flatMap((module: MeModule): NavigationModule[] => {
    const items: NavigationItem[] = toItems(module, screens);
    return items.length > 0 ? [{ key: module.key, label: module.label, items }] : [];
  });
}

export function firstScreenPath(modules: MeModule[], screens: RoutedScreens): string | null {
  return buildNavigation(modules, screens)[0]?.items[0]?.path ?? null;
}
