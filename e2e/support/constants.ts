export const E2E_PORT: number = 4173;

export const E2E_BASE_URL: string = `http://localhost:${E2E_PORT}`;

export const E2E_API_URL: string = "http://api.e2e.test";

export const VIEWPORT_WIDTHS: readonly number[] = [320, 768, 1280, 1536];

export const VIEWPORT_HEIGHT: number = 800;

export const MOBILE_MAX_WIDTH: number = 767;

export const HTTP_OK: number = 200;

export const HTTP_CREATED: number = 201;

export const HTTP_NO_CONTENT: number = 204;

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export const CORS_HEADERS: Readonly<Record<string, string>> = {
  "Access-Control-Allow-Origin": E2E_BASE_URL,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Expose-Headers": "Retry-After, X-Request-Id",
};

export const E2E_ACCESS_TOKEN: string = "e2e-access-token";

export const ACCESS_TOKEN_LIFETIME_SECONDS: number = 900;

export const SKIP_REASONS = {
  PHONES_ONLY: "Only phones show this layout",
  TABLETS_UP: "Only tablets and larger screens show this layout",
} as const;

export const SCREEN_URLS = {
  MENU: "/menu",
  MY_ORDERS: "/my-orders",
  DASHBOARD: "/dashboard",
  PRODUCTS: "/catalog/products",
  ADMIN_USERS: "/admin/users",
} as const;

export const UNKNOWN_URL: string = "/nada-por-aqui";
