export const API_PATHS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",
  ME: "/me",
  ADMIN_USERS: "/admin/users",
} as const;

export const ADMIN_USER_PATHS = {
  ROLE: (id: string): string => `${API_PATHS.ADMIN_USERS}/${id}/role`,
  DISABLE: (id: string): string => `${API_PATHS.ADMIN_USERS}/${id}/disable`,
  ENABLE: (id: string): string => `${API_PATHS.ADMIN_USERS}/${id}/enable`,
} as const;

export const AUTH_PATH_PREFIX: string = "/auth/";

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PATCH: "PATCH",
} as const;

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_CONTENT: 422,
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
  CANNOT_CHANGE_OWN_ACCOUNT: "CANNOT_CHANGE_OWN_ACCOUNT",
  LAST_ACTIVE_ADMIN: "LAST_ACTIVE_ADMIN",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
