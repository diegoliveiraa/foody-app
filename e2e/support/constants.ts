export const E2E_PORT: number = 4173;

export const E2E_BASE_URL: string = `http://localhost:${E2E_PORT}`;

export const E2E_API_URL: string = "http://api.e2e.test";

export const VIEWPORT_WIDTHS: readonly number[] = [320, 768, 1280, 1536];

export const VIEWPORT_HEIGHT: number = 800;

export const HTTP_OK: number = 200;

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];
