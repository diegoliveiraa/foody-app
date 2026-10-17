import type { QueryReturnValue } from "@reduxjs/toolkit/query";
import { delay, http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi, type Mock, type MockInstance } from "vitest";
import type { ApiError, ProblemDetails } from "@/@types/problem-details";
import { selectAccessToken, sessionExpired, tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { apiUrl, server } from "@/test/server";
import { baseQueryApiFor, createTestStore, type TestStore } from "@/test/store";
import { baseQuery } from "./api";

type ProbeResult = QueryReturnValue<unknown, ApiError, unknown>;

const PROBE_PATH: string = "/probe";
const UNAUTHORIZED: ProblemDetails = problem(401, "UNAUTHENTICATED");
const REFRESH_REJECTED: ProblemDetails = problem(401, "REFRESH_TOKEN_INVALID");
const RATE_LIMITED: ProblemDetails = problem(429, "RATE_LIMITED");

function credentialsSentTo(fetchSpy: MockInstance<typeof fetch>, path: string): string[] {
  return fetchSpy.mock.calls
    .map(([input]: Parameters<typeof fetch>): unknown => input)
    .filter((input: unknown): input is Request => input instanceof Request)
    .filter((request: Request): boolean => new URL(request.url).pathname === path)
    .map((request: Request): string => request.credentials);
}

function signedInStore(token: string = "expired-token"): TestStore {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived(token));
  return testStore;
}

function answerProbeOnlyWith(validToken: string, probeCalls: string[]): void {
  server.use(
    http.get(apiUrl(PROBE_PATH), ({ request }) => {
      const authorization: string = request.headers.get("Authorization") ?? "";
      probeCalls.push(authorization);
      if (authorization !== `Bearer ${validToken}`) {
        return HttpResponse.json(UNAUTHORIZED, { status: 401 });
      }
      return HttpResponse.json({ ok: true });
    }),
  );
}

function answerRefreshWith(token: string, refreshCalls: string[], latencyMs: number = 0): void {
  server.use(
    http.post(apiUrl("/auth/refresh"), async ({ request }) => {
      refreshCalls.push(request.method);
      await delay(latencyMs);
      return HttpResponse.json({ accessToken: token, expiresIn: 900 });
    }),
  );
}

afterEach((): void => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("base query", () => {
  it("sends the access token in memory as a Bearer header", async () => {
    const { store }: TestStore = signedInStore("valid-token");
    const probeCalls: string[] = [];
    answerProbeOnlyWith("valid-token", probeCalls);

    const result: ProbeResult = await baseQuery(PROBE_PATH, baseQueryApiFor(store), {});

    expect(result.data).toEqual({ ok: true });
    expect(probeCalls).toEqual(["Bearer valid-token"]);
  });

  it("never sends the bearer to the auth endpoints, which authenticate by cookie", async () => {
    const { store }: TestStore = signedInStore("valid-token");
    const authorizations: (string | null)[] = [];
    server.use(
      http.post(apiUrl("/auth/logout"), ({ request }) => {
        authorizations.push(request.headers.get("Authorization"));
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await baseQuery({ url: "/auth/logout", method: "POST" }, baseQueryApiFor(store), {});

    expect(authorizations).toEqual([null]);
  });

  it("refreshes once with the cookie and retries once when the API answers 401", async () => {
    const { store }: TestStore = signedInStore();
    const probeCalls: string[] = [];
    const refreshCalls: string[] = [];
    const fetchSpy: MockInstance<typeof fetch> = vi.spyOn(globalThis, "fetch");
    answerProbeOnlyWith("renewed-token", probeCalls);
    answerRefreshWith("renewed-token", refreshCalls);

    const result: ProbeResult = await baseQuery(PROBE_PATH, baseQueryApiFor(store), {});

    expect(result.data).toEqual({ ok: true });
    expect(refreshCalls).toHaveLength(1);
    expect(credentialsSentTo(fetchSpy, "/auth/refresh")).toEqual(["include"]);
    expect(probeCalls).toEqual(["Bearer expired-token", "Bearer renewed-token"]);
    expect(selectAccessToken(store.getState())).toBe("renewed-token");
  });

  it("makes concurrent 401s share a single refresh", async () => {
    const { store }: TestStore = signedInStore();
    const refreshCalls: string[] = [];
    answerProbeOnlyWith("renewed-token", []);
    answerRefreshWith("renewed-token", refreshCalls, 20);

    const results: ProbeResult[] = await Promise.all([
      baseQuery(PROBE_PATH, baseQueryApiFor(store), {}),
      baseQuery(PROBE_PATH, baseQueryApiFor(store), {}),
      baseQuery(PROBE_PATH, baseQueryApiFor(store), {}),
    ]);

    expect(results.map((result: ProbeResult): unknown => result.data)).toEqual([
      { ok: true },
      { ok: true },
      { ok: true },
    ]);
    expect(refreshCalls).toHaveLength(1);
  });

  it("retries a request sent with a stale token without refreshing again", async () => {
    const { store }: TestStore = signedInStore("renewed-token");
    const refreshCalls: string[] = [];
    answerRefreshWith("another-token", refreshCalls);
    answerProbeOnlyWith("renewed-token", []);
    server.use(
      http.get(
        apiUrl(PROBE_PATH),
        () => {
          store.dispatch(tokenReceived("renewed-token"));
          return HttpResponse.json(UNAUTHORIZED, { status: 401 });
        },
        { once: true },
      ),
    );
    store.dispatch(tokenReceived("stale-token"));

    const result: ProbeResult = await baseQuery(PROBE_PATH, baseQueryApiFor(store), {});

    expect(result.data).toEqual({ ok: true });
    expect(refreshCalls).toEqual([]);
  });

  it("retries only once: a second 401 goes back to the caller", async () => {
    const { store }: TestStore = signedInStore();
    const probeCalls: string[] = [];
    const refreshCalls: string[] = [];
    answerProbeOnlyWith("never-valid", probeCalls);
    answerRefreshWith("renewed-token", refreshCalls);

    const result: ProbeResult = await baseQuery(PROBE_PATH, baseQueryApiFor(store), {});

    expect(result.error?.status).toBe(401);
    expect(refreshCalls).toHaveLength(1);
    expect(probeCalls).toHaveLength(2);
  });

  it("ends the session when the refresh is refused", async () => {
    const { store }: TestStore = signedInStore();
    const dispatch: Mock = vi.fn(store.dispatch);
    answerProbeOnlyWith("never-valid", []);
    server.use(
      http.post(apiUrl("/auth/refresh"), () =>
        HttpResponse.json(REFRESH_REJECTED, { status: 401 }),
      ),
    );

    const result: ProbeResult = await baseQuery(PROBE_PATH, baseQueryApiFor(store, dispatch), {});

    expect(result.error?.status).toBe(401);
    expect(selectAccessToken(store.getState())).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(sessionExpired());
  });

  it("never refreshes when an auth endpoint answers 401", async () => {
    const { store }: TestStore = createTestStore();
    const refreshCalls: string[] = [];
    answerRefreshWith("renewed-token", refreshCalls);
    server.use(
      http.post(apiUrl("/auth/login"), () =>
        HttpResponse.json(problem(401, "INVALID_CREDENTIALS"), { status: 401 }),
      ),
    );

    const result: ProbeResult = await baseQuery(
      { url: "/auth/login", method: "POST", body: {} },
      baseQueryApiFor(store),
      {},
    );

    expect(result.error?.status).toBe(401);
    expect(refreshCalls).toEqual([]);
  });

  it("attaches the Retry-After seconds of a 429 to the error", async () => {
    const { store }: TestStore = signedInStore("valid-token");
    server.use(
      http.get(apiUrl(PROBE_PATH), () =>
        HttpResponse.json(RATE_LIMITED, { status: 429, headers: { "Retry-After": "12" } }),
      ),
    );

    const result: ProbeResult = await baseQuery(PROBE_PATH, baseQueryApiFor(store), {});

    expect(result.error).toMatchObject({ status: 429, retryAfterSeconds: 12 });
  });

  it("keeps the session when the refresh itself is rate limited, passing its wait on", async () => {
    const { store }: TestStore = signedInStore();
    answerProbeOnlyWith("never-valid", []);
    server.use(
      http.post(apiUrl("/auth/refresh"), () =>
        HttpResponse.json(RATE_LIMITED, { status: 429, headers: { "Retry-After": "30" } }),
      ),
    );

    const result: ProbeResult = await baseQuery(PROBE_PATH, baseQueryApiFor(store), {});

    expect(result.error).toMatchObject({ status: 429, retryAfterSeconds: 30 });
    expect(selectAccessToken(store.getState())).toBe("expired-token");
  });

  it("runs the refresh under the cross-tab lock when the browser offers one", async () => {
    const { store }: TestStore = signedInStore();
    const lockNames: string[] = [];
    vi.stubGlobal("navigator", {
      locks: {
        request: (name: string, task: () => Promise<unknown>): Promise<unknown> => {
          lockNames.push(name);
          return task();
        },
      },
    });
    answerProbeOnlyWith("renewed-token", []);
    answerRefreshWith("renewed-token", []);

    const result: ProbeResult = await baseQuery(PROBE_PATH, baseQueryApiFor(store), {});

    expect(result.data).toEqual({ ok: true });
    expect(lockNames).toEqual(["foody-refresh"]);
  });
});
