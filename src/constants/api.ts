export const API_PATHS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",
  ME: "/me",
} as const;

export const AUTH_PATH_PREFIX: string = "/auth/";

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
} as const;

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
} as const;

export const HTTP_HEADERS = {
  AUTHORIZATION: "Authorization",
  RETRY_AFTER: "Retry-After",
} as const;

export const BEARER_PREFIX: string = "Bearer ";

export const CREDENTIALS_INCLUDE: RequestCredentials = "include";

export const REFRESH_LOCK_NAME: string = "foody-refresh";

export const ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_ALREADY_REGISTERED: "EMAIL_ALREADY_REGISTERED",
  RATE_LIMITED: "RATE_LIMITED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
