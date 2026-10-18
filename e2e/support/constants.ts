export const E2E_PORT: number = 4173;

export const E2E_BASE_URL: string = `http://localhost:${E2E_PORT}`;

export const E2E_API_URL: string = "http://api.e2e.test";

export const INTEGRATED_API_URL: string = "http://localhost:8080";

export const VIEWPORT_WIDTHS: readonly number[] = [320, 768, 1280, 1536];

export const VIEWPORT_HEIGHT: number = 800;

export const MOBILE_MAX_WIDTH: number = 767;

export const DIALOG_CHECK_WIDTHS: readonly number[] = [640, 768, 1024, 1280, 1536];

export const STACKED_DIALOG_ACTIONS_MAX_WIDTH: number = 639;

export const LAYOUT_TOLERANCE_PX: number = 0.5;

export const HTTP_OK: number = 200;

export const HTTP_CREATED: number = 201;

export const HTTP_NO_CONTENT: number = 204;

export const HTTP_BAD_REQUEST: number = 400;

export const HTTP_NOT_FOUND: number = 404;

export const HTTP_UNPROCESSABLE: number = 422;

export const HTTP_INTERNAL_ERROR: number = 500;

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
  LIST_CARDS: "Only screens narrower than 1024px list cards",
  LIST_TABLE: "Only screens of 1024px or more list a table",
} as const;

export const SCREEN_URLS = {
  MENU: "/menu",
  CHECKOUT: "/menu/checkout",
  MY_ORDERS: "/my-orders",
  ORDERS: "/orders",
  ORDER_HISTORY: "/orders/history",
  DASHBOARD: "/dashboard",
  PRODUCTS: "/catalog/products",
  CATEGORIES: "/catalog/categories",
  ADMIN_USERS: "/admin/users",
} as const;

export const UNKNOWN_URL: string = "/nada-por-aqui";
