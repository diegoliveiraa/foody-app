import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthResponse } from "@/@types/auth";
import type { MeResponse } from "@/@types/me";
import { MESSAGES } from "@/constants/messages";
import { TOAST_IDS } from "@/constants/toasts";
import { authApi } from "@/services/auth";
import { meApi } from "@/services/me";
import type { AppStore } from "@/store";
import {
  logoutRequested,
  selectAccessToken,
  sessionExpired,
  tokenReceived,
} from "@/store/slices/session";
import { problem } from "@/test/problems";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";

vi.mock("sonner", () => ({ toast: vi.fn() }));

const SIGNED_IN: AuthResponse = { accessToken: "fresh-token", expiresIn: 900 };

const CUSTOMER: MeResponse = {
  user: { id: "u-1", name: "Ana", email: "ana@foody.dev" },
  modules: [],
};

function cachedQueries(store: AppStore): number {
  return Object.keys(store.getState().api.queries).length;
}

async function signedInWithCachedMe(): Promise<TestStore> {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("current-token"));
  server.use(http.get(apiUrl("/me"), () => HttpResponse.json(CUSTOMER)));
  await testStore.store.dispatch(meApi.endpoints.getMe.initiate());
  return testStore;
}

afterEach((): void => {
  vi.clearAllMocks();
});

describe("session listeners", () => {
  it("keep the access token in memory after a successful login", async () => {
    const { store }: TestStore = createTestStore();
    server.use(http.post(apiUrl("/auth/login"), () => HttpResponse.json(SIGNED_IN)));

    await store
      .dispatch(
        authApi.endpoints.login.initiate({ email: "ana@foody.dev", password: "secret-123" }),
      )
      .unwrap();

    expect(selectAccessToken(store.getState())).toBe("fresh-token");
  });

  it("sign the new customer in after a successful registration", async () => {
    const { store }: TestStore = createTestStore();
    server.use(
      http.post(apiUrl("/auth/register"), () => HttpResponse.json(SIGNED_IN, { status: 201 })),
    );

    await store
      .dispatch(
        authApi.endpoints.register.initiate({
          name: "Ana",
          email: "ana@foody.dev",
          password: "secret-123",
        }),
      )
      .unwrap();

    expect(selectAccessToken(store.getState())).toBe("fresh-token");
  });

  it("on logout forget the token, leave for /login and only then empty the API cache", async () => {
    const { store, navigate }: TestStore = await signedInWithCachedMe();
    const queriesWhenLeaving: number[] = [];
    navigate.mockImplementation(async (): Promise<void> => {
      queriesWhenLeaving.push(cachedQueries(store));
    });
    const logoutCalls: string[] = [];
    server.use(
      http.post(apiUrl("/auth/logout"), ({ request }) => {
        logoutCalls.push(request.method);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    store.dispatch(logoutRequested());

    await vi.waitFor((): void => expect(cachedQueries(store)).toBe(0));
    expect(selectAccessToken(store.getState())).toBeNull();
    expect(navigate).toHaveBeenCalledWith("/login");
    expect(queriesWhenLeaving).toEqual([1]);
    expect(logoutCalls).toEqual(["POST"]);
  });

  it("end the local session on logout even when the API call fails", async () => {
    const { store, navigate }: TestStore = await signedInWithCachedMe();
    server.use(
      http.post(apiUrl("/auth/logout"), () =>
        HttpResponse.json(problem(500, "INTERNAL_ERROR"), { status: 500 }),
      ),
    );

    store.dispatch(logoutRequested());

    await vi.waitFor((): void => expect(navigate).toHaveBeenCalledWith("/login"));
    expect(selectAccessToken(store.getState())).toBeNull();
  });

  it("tell the user, in neutral words, that the session ended, leave for /login and empty the API cache", async () => {
    const { store, navigate }: TestStore = await signedInWithCachedMe();

    store.dispatch(sessionExpired());

    await vi.waitFor((): void => expect(cachedQueries(store)).toBe(0));
    expect(navigate).toHaveBeenCalledWith("/login");
    expect(toast).toHaveBeenCalledWith(
      "Sua sessão terminou. Entre novamente.",
      expect.objectContaining({ id: TOAST_IDS.SESSION_ENDED }),
    );
    expect(MESSAGES.SESSION.ENDED).toBe("Sua sessão terminou. Entre novamente.");
  });
});
