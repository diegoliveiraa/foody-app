import {
  createApi,
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryMeta,
  type QueryReturnValue,
} from "@reduxjs/toolkit/query/react";
import type { AuthResponse } from "@/@types/auth";
import type { ApiError } from "@/@types/problem-details";
import {
  API_PATHS,
  AUTH_PATH_PREFIX,
  BEARER_PREFIX,
  CREDENTIALS_INCLUDE,
  HTTP_HEADERS,
  HTTP_METHODS,
  HTTP_STATUS,
  REFRESH_LOCK_NAME,
} from "@/constants/api";
import type { RootState } from "@/store";
import { selectAccessToken, sessionExpired, tokenReceived } from "@/store/slices/session";
import { serializeSearchParams } from "@/utils/search-params";
import { CACHE_TAGS } from "./cache-tags";

type ApiResult<T> = QueryReturnValue<T, ApiError, FetchBaseQueryMeta | undefined>;

type ApiBaseQuery = BaseQueryFn<string | FetchArgs, unknown, ApiError, object, FetchBaseQueryMeta>;

const REFRESH_REQUEST: FetchArgs = {
  url: API_PATHS.REFRESH,
  method: HTTP_METHODS.POST,
  credentials: CREDENTIALS_INCLUDE,
};

let pendingRefresh: Promise<ApiResult<AuthResponse>> | null = null;

function readToken(getState: () => unknown): string | null {
  return selectAccessToken(getState() as RootState);
}

function isAuthRequest(args: string | FetchArgs): boolean {
  const url: string = typeof args === "string" ? args : args.url;
  return url.startsWith(AUTH_PATH_PREFIX);
}

const rawBaseQuery: ApiBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  paramsSerializer: serializeSearchParams,
  prepareHeaders: (headers: Headers, { getState, arg }): Headers => {
    const token: string | null = readToken(getState);
    if (token === null || isAuthRequest(arg)) {
      return headers;
    }
    headers.set(HTTP_HEADERS.AUTHORIZATION, `${BEARER_PREFIX}${token}`);
    return headers;
  },
});

function parseRetryAfter(meta: FetchBaseQueryMeta | undefined): number | undefined {
  const seconds: number = Number(meta?.response?.headers.get(HTTP_HEADERS.RETRY_AFTER));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

function withRetryAfter<T>(result: ApiResult<T>): ApiResult<T> {
  if (result.error?.status !== HTTP_STATUS.TOO_MANY_REQUESTS) {
    return result;
  }
  return {
    error: { ...result.error, retryAfterSeconds: parseRetryAfter(result.meta) },
    meta: result.meta,
  };
}

async function send(
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: object,
): Promise<ApiResult<unknown>> {
  return withRetryAfter(await rawBaseQuery(args, api, extraOptions));
}

function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  const locks: LockManager | undefined = globalThis.navigator?.locks;
  if (!locks) {
    return task();
  }
  return locks.request(REFRESH_LOCK_NAME, task);
}

async function requestAccessToken(api: BaseQueryApi): Promise<ApiResult<AuthResponse>> {
  const detached: BaseQueryApi = { ...api, signal: new AbortController().signal };
  const result: ApiResult<unknown> = await send(REFRESH_REQUEST, detached, {});
  if (result.error) {
    return { error: result.error, meta: result.meta };
  }
  const auth: AuthResponse = result.data as AuthResponse;
  api.dispatch(tokenReceived(auth.accessToken));
  return { data: auth, meta: result.meta };
}

export function refreshAccessToken(api: BaseQueryApi): Promise<ApiResult<AuthResponse>> {
  pendingRefresh ??= withRefreshLock((): Promise<ApiResult<AuthResponse>> =>
    requestAccessToken(api),
  ).finally((): void => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}

function endSession(api: BaseQueryApi): void {
  if (readToken(api.getState) === null) {
    return;
  }
  api.dispatch(sessionExpired());
}

async function renewToken(
  api: BaseQueryApi,
  tokenSent: string | null,
): Promise<ApiResult<AuthResponse> | null> {
  const current: string | null = readToken(api.getState);
  if (current !== null && current !== tokenSent) {
    return null;
  }
  return refreshAccessToken(api);
}

export const baseQuery: ApiBaseQuery = async (args, api, extraOptions) => {
  const tokenSent: string | null = readToken(api.getState);
  const result: ApiResult<unknown> = await send(args, api, extraOptions);
  if (result.error?.status !== HTTP_STATUS.UNAUTHORIZED || isAuthRequest(args)) {
    return result;
  }
  const renewal: ApiResult<AuthResponse> | null = await renewToken(api, tokenSent);
  if (renewal?.error?.status === HTTP_STATUS.UNAUTHORIZED) {
    endSession(api);
    return result;
  }
  if (renewal?.error) {
    return { error: renewal.error, meta: renewal.meta };
  }
  return send(args, api, extraOptions);
};

export const api = createApi({
  baseQuery,
  tagTypes: Object.values(CACHE_TAGS),
  endpoints: () => ({}),
});
