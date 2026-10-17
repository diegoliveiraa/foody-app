export const API_PATHS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",
  ME: "/me",
  ADMIN_USERS: "/admin/users",
  MENU: "/menu",
  MENU_QUOTE: "/menu/quote",
  CATALOG_CATEGORIES: "/catalog/categories",
  CATALOG_PRODUCTS: "/catalog/products",
  MY_ORDERS: "/my-orders",
  ORDERS: "/orders",
} as const;

export const ADMIN_USER_PATHS = {
  ROLE: (id: string): string => `${API_PATHS.ADMIN_USERS}/${id}/role`,
  DISABLE: (id: string): string => `${API_PATHS.ADMIN_USERS}/${id}/disable`,
  ENABLE: (id: string): string => `${API_PATHS.ADMIN_USERS}/${id}/enable`,
} as const;

export const CATEGORY_PATHS = {
  ONE: (id: string): string => `${API_PATHS.CATALOG_CATEGORIES}/${id}`,
  DISABLE: (id: string): string => `${API_PATHS.CATALOG_CATEGORIES}/${id}/disable`,
  ENABLE: (id: string): string => `${API_PATHS.CATALOG_CATEGORIES}/${id}/enable`,
} as const;

export const PRODUCT_PATHS = {
  ONE: (id: string): string => `${API_PATHS.CATALOG_PRODUCTS}/${id}`,
  DISABLE: (id: string): string => `${API_PATHS.CATALOG_PRODUCTS}/${id}/disable`,
  ENABLE: (id: string): string => `${API_PATHS.CATALOG_PRODUCTS}/${id}/enable`,
} as const;

export const MY_ORDER_PATHS = {
  ONE: (id: string): string => `${API_PATHS.MY_ORDERS}/${id}`,
  CANCEL: (id: string): string => `${API_PATHS.MY_ORDERS}/${id}/cancel`,
  REQUEST_CANCELLATION: (id: string): string => `${API_PATHS.MY_ORDERS}/${id}/cancellation-request`,
} as const;

export const ORDER_PATHS = {
  ONE: (id: string): string => `${API_PATHS.ORDERS}/${id}`,
  STATUS: (id: string): string => `${API_PATHS.ORDERS}/${id}/status`,
  CANCEL: (id: string): string => `${API_PATHS.ORDERS}/${id}/cancel`,
  APPROVE_CANCELLATION: (id: string): string =>
    `${API_PATHS.ORDERS}/${id}/cancellation-request/approve`,
  DECLINE_CANCELLATION: (id: string): string =>
    `${API_PATHS.ORDERS}/${id}/cancellation-request/decline`,
} as const;

export const AUTH_PATH_PREFIX: string = "/auth/";

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
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
  CATEGORY_NAME_TAKEN: "CATEGORY_NAME_TAKEN",
  CATEGORY_IN_USE: "CATEGORY_IN_USE",
  UNKNOWN_CATEGORY: "UNKNOWN_CATEGORY",
  PRODUCT_IN_USE: "PRODUCT_IN_USE",
  PRODUCT_UNAVAILABLE: "PRODUCT_UNAVAILABLE",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  CANCELLATION_NOT_ALLOWED: "CANCELLATION_NOT_ALLOWED",
  INVALID_CANCELLATION_REASON: "INVALID_CANCELLATION_REASON",
  PENDING_CANCELLATION_REQUEST: "PENDING_CANCELLATION_REQUEST",
  CANCELLATION_ALREADY_REQUESTED: "CANCELLATION_ALREADY_REQUESTED",
  NO_PENDING_CANCELLATION_REQUEST: "NO_PENDING_CANCELLATION_REQUEST",
  CONCURRENT_UPDATE: "CONCURRENT_UPDATE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const STALE_ORDER_CODES: ReadonlySet<string> = new Set<ErrorCode>([
  ERROR_CODES.INVALID_STATUS_TRANSITION,
  ERROR_CODES.CANCELLATION_NOT_ALLOWED,
  ERROR_CODES.INVALID_CANCELLATION_REASON,
  ERROR_CODES.PENDING_CANCELLATION_REQUEST,
  ERROR_CODES.CANCELLATION_ALREADY_REQUESTED,
  ERROR_CODES.NO_PENDING_CANCELLATION_REQUEST,
  ERROR_CODES.CONCURRENT_UPDATE,
]);
