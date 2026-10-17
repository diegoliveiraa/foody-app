import type { MutationActionCreatorResult, QueryActionCreatorResult } from "@reduxjs/toolkit/query";
import {
  createContext,
  data,
  redirect,
  RouterContextProvider,
  type LoaderFunction,
  type LoaderFunctionArgs,
  type RouteObject,
  type RouterContext,
} from "react-router";
import type { MeResponse, MeScreen } from "@/@types/me";
import { HTTP_STATUS } from "@/constants/api";
import { REDIRECT_TO_PARAM, ROUTE_PATHS } from "@/constants/routes";
import type { ScreenKey } from "@/constants/screens";
import { authApi } from "@/services/auth";
import { meApi } from "@/services/me";
import type { AppStore } from "@/store";
import { selectAccessToken } from "@/store/slices/session";
import { isPublicHandle, isScreenHandle } from "./handles";
import { firstScreenPath, type RoutedScreens } from "./navigation";
import { RouteErrorBoundary } from "./route-error-boundary";

type Guard = Pick<RouteObject, "loader" | "ErrorBoundary">;

type MeRequest = QueryActionCreatorResult<typeof meApi.endpoints.getMe.Types.QueryDefinition>;

type RefreshRequest = MutationActionCreatorResult<
  typeof authApi.endpoints.refresh.Types.MutationDefinition
>;

export const STORE_CONTEXT: RouterContext<AppStore> = createContext<AppStore>();

const restorations: WeakMap<AppStore, Promise<void>> = new WeakMap<AppStore, Promise<void>>();

export function routerContextFor(store: AppStore): RouterContextProvider {
  const context: RouterContextProvider = new RouterContextProvider();
  context.set(STORE_CONTEXT, store);
  return context;
}

function isSignedIn(store: AppStore): boolean {
  return selectAccessToken(store.getState()) !== null;
}

async function refreshIfSignedOut(store: AppStore): Promise<void> {
  if (isSignedIn(store)) {
    return;
  }
  const refresh: RefreshRequest = store.dispatch(authApi.endpoints.refresh.initiate());
  await refresh;
  refresh.reset();
}

function restoreSession(store: AppStore): Promise<void> {
  const known: Promise<void> | undefined = restorations.get(store);
  if (known) {
    return known;
  }
  const restoration: Promise<void> = refreshIfSignedOut(store);
  restorations.set(store, restoration);
  return restoration;
}

export async function loadSession(store: AppStore): Promise<MeResponse | null> {
  await restoreSession(store);
  if (!isSignedIn(store)) {
    return null;
  }
  const request: MeRequest = store.dispatch(meApi.endpoints.getMe.initiate());
  try {
    return await request.unwrap();
  } catch (error: unknown) {
    if (!isSignedIn(store)) {
      return null;
    }
    throw error;
  } finally {
    request.unsubscribe();
  }
}

function loginRedirectFrom(url: URL): Response {
  const search: URLSearchParams = new URLSearchParams({
    [REDIRECT_TO_PARAM]: `${url.pathname}${url.search}`,
  });
  return redirect(`${ROUTE_PATHS.LOGIN}?${search.toString()}`);
}

function hasScreen(me: MeResponse, screenKey: ScreenKey): boolean {
  return me.modules.some((module: MeResponse["modules"][number]): boolean =>
    module.screens.some((screen: MeScreen): boolean => screen.key === screenKey),
  );
}

function forbidden(): never {
  throw data(null, { status: HTTP_STATUS.FORBIDDEN });
}

function homeRedirect(me: MeResponse, screens: RoutedScreens): Response {
  const home: string | null = firstScreenPath(me.modules, screens);
  return home === null ? forbidden() : redirect(home);
}

export async function rootLoader({ context }: LoaderFunctionArgs): Promise<null> {
  await loadSession(context.get(STORE_CONTEXT));
  return null;
}

export function homeLoader(screens: RoutedScreens): LoaderFunction {
  return async ({ context }: LoaderFunctionArgs): Promise<Response> => {
    const me: MeResponse | null = await loadSession(context.get(STORE_CONTEXT));
    return me === null ? redirect(ROUTE_PATHS.LOGIN) : homeRedirect(me, screens);
  };
}

export function publicLoader(screens: RoutedScreens): LoaderFunction {
  return async ({ context }: LoaderFunctionArgs): Promise<Response | null> => {
    const me: MeResponse | null = await loadSession(context.get(STORE_CONTEXT));
    return me === null ? null : homeRedirect(me, screens);
  };
}

export function screenLoader(screenKey: ScreenKey): LoaderFunction {
  return async ({ context, url }: LoaderFunctionArgs): Promise<Response | null> => {
    const me: MeResponse | null = await loadSession(context.get(STORE_CONTEXT));
    if (me === null) {
      return loginRedirectFrom(url);
    }
    return hasScreen(me, screenKey) ? null : forbidden();
  };
}

function chainLoaders(guard: LoaderFunction, own: RouteObject["loader"]): LoaderFunction {
  if (typeof own !== "function") {
    return guard;
  }
  return async (args: LoaderFunctionArgs): Promise<unknown> => (await guard(args)) ?? own(args);
}

function guardOf(route: RouteObject, screens: RoutedScreens): Guard {
  if (isScreenHandle(route.handle)) {
    return {
      loader: chainLoaders(screenLoader(route.handle.screenKey), route.loader),
      ErrorBoundary: RouteErrorBoundary,
    };
  }
  if (isPublicHandle(route.handle)) {
    return { loader: chainLoaders(publicLoader(screens), route.loader) };
  }
  return {};
}

export function guardRoutes(routes: RouteObject[], screens: RoutedScreens): RouteObject[] {
  return routes.map((route: RouteObject): RouteObject => {
    const guarded: RouteObject = { ...route, ...guardOf(route, screens) };
    if (guarded.index === true || guarded.children === undefined) {
      return guarded;
    }
    return { ...guarded, children: guardRoutes(guarded.children, screens) };
  });
}
