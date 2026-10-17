import { http, HttpResponse } from "msw";
import {
  createMemoryRouter,
  isRouteErrorResponse,
  type DataRouter,
  type RouteObject,
  type RouterContextProvider,
  type RouterState,
} from "react-router";
import { describe, expect, it } from "vitest";
import type { MeResponse } from "@/@types/me";
import { problem } from "@/test/problems";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { routerContextFor } from "./guards";
import { ROUTES } from "./index";

const CUSTOMER: MeResponse = {
  user: { id: "u-1", name: "Ana", email: "ana@foody.dev" },
  modules: [
    {
      key: "store",
      label: "Loja",
      screens: [
        { key: "store.menu", label: "Cardápio", actions: ["PLACE_ORDER"] },
        { key: "store.my-orders", label: "Pedidos", actions: ["CANCEL"] },
      ],
    },
  ],
};

const STAFF: MeResponse = {
  user: { id: "u-2", name: "Bruno", email: "bruno@foody.dev" },
  modules: [
    {
      key: "dashboard",
      label: "Dashboard",
      screens: [{ key: "dashboard.overview", label: "Visão geral", actions: [] }],
    },
    {
      key: "orders",
      label: "Pedidos",
      screens: [{ key: "orders.order-list", label: "Pedidos", actions: ["UPDATE_STATUS"] }],
    },
  ],
};

function signedInAs(me: MeResponse, refreshCalls: string[] = []): void {
  server.use(
    http.post(apiUrl("/auth/refresh"), () => {
      refreshCalls.push("refresh");
      return HttpResponse.json({ accessToken: "restored-token", expiresIn: 900 });
    }),
    http.get(apiUrl("/me"), () => HttpResponse.json(me)),
  );
}

function signedOut(): void {
  server.use(
    http.post(apiUrl("/auth/refresh"), () =>
      HttpResponse.json(problem(401, "REFRESH_TOKEN_INVALID"), { status: 401 }),
    ),
  );
}

function withFreshLazyObjects(routes: RouteObject[]): RouteObject[] {
  return routes.map(
    (route: RouteObject): RouteObject =>
      ({
        ...route,
        ...(typeof route.lazy === "object" ? { lazy: { ...route.lazy } } : {}),
        ...(route.children ? { children: withFreshLazyObjects(route.children) } : {}),
      }) as RouteObject,
  );
}

function isSettled(state: RouterState): boolean {
  return state.initialized && state.navigation.state === "idle";
}

async function open(path: string): Promise<DataRouter> {
  const { store }: TestStore = createTestStore();
  const router: DataRouter = createMemoryRouter(withFreshLazyObjects(ROUTES), {
    initialEntries: [path],
    getContext: (): RouterContextProvider => routerContextFor(store),
  });
  await new Promise<void>((resolve: () => void): void => {
    if (isSettled(router.state)) {
      resolve();
      return;
    }
    const unsubscribe: () => void = router.subscribe((state: RouterState): void => {
      if (!isSettled(state)) {
        return;
      }
      unsubscribe();
      resolve();
    });
  });
  return router;
}

function errorStatuses(router: DataRouter): number[] {
  return Object.values(router.state.errors ?? {}).flatMap((error: unknown): number[] =>
    isRouteErrorResponse(error) ? [error.status] : [],
  );
}

describe("route guards", () => {
  it("send a signed-out visitor of a private screen to /login, remembering the way back", async () => {
    signedOut();

    const router: DataRouter = await open("/menu?category=pizzas");

    expect(router.state.location.pathname).toBe("/login");
    expect(new URLSearchParams(router.state.location.search).get("redirectTo")).toBe(
      "/menu?category=pizzas",
    );
  });

  it("restore the session from the refresh cookie before opening a private screen", async () => {
    signedInAs(CUSTOMER);

    const router: DataRouter = await open("/my-orders");

    expect(router.state.location.pathname).toBe("/my-orders");
    expect(errorStatuses(router)).toEqual([]);
  });

  it("refresh only once while several loaders wait for the session", async () => {
    const refreshCalls: string[] = [];
    signedInAs(CUSTOMER, refreshCalls);

    await open("/menu");

    expect(refreshCalls).toHaveLength(1);
  });

  it("render the forbidden page for a screen absent from /me", async () => {
    signedInAs(STAFF);

    const router: DataRouter = await open("/admin/users");

    expect(router.state.location.pathname).toBe("/admin/users");
    expect(errorStatuses(router)).toEqual([403]);
  });

  it("send / to the first screen of the first module: the menu for a customer", async () => {
    signedInAs(CUSTOMER);

    const router: DataRouter = await open("/");

    expect(router.state.location.pathname).toBe("/menu");
  });

  it("send / to the dashboard for staff", async () => {
    signedInAs(STAFF);

    const router: DataRouter = await open("/");

    expect(router.state.location.pathname).toBe("/dashboard");
  });

  it("send / to /login when nobody is signed in", async () => {
    signedOut();

    const router: DataRouter = await open("/");

    expect(router.state.location.pathname).toBe("/login");
  });

  it("send a signed-in user away from /login to their home", async () => {
    signedInAs(STAFF);

    const router: DataRouter = await open("/login");

    expect(router.state.location.pathname).toBe("/dashboard");
  });

  it("let a signed-out visitor open the registration page", async () => {
    signedOut();

    const router: DataRouter = await open("/register");

    expect(router.state.location.pathname).toBe("/register");
    expect(errorStatuses(router)).toEqual([]);
  });
});
