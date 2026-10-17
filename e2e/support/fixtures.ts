import { test as base, expect, type Request, type Route } from "@playwright/test";
import { CORS_HEADERS, E2E_API_URL, HTTP_NO_CONTENT, HTTP_OK, type HttpMethod } from "./constants";

export interface RecordedRequest {
  method: string;
  url: URL;
  body: unknown;
}

export interface ApiStubs {
  respond<T>(
    method: HttpMethod,
    path: string,
    body: T,
    status?: number,
    headers?: Record<string, string>,
  ): Promise<void>;
  requests(method: HttpMethod, path: string): RecordedRequest[];
}

interface Fixtures {
  api: ApiStubs;
}

function recordOf(request: Request): RecordedRequest {
  return {
    method: request.method(),
    url: new URL(request.url()),
    body: request.postData() === null ? null : (request.postDataJSON() as unknown),
  };
}

export const test = base.extend<Fixtures>({
  api: [
    async ({ page }, provide): Promise<void> => {
      const unstubbed: string[] = [];
      const answered: RecordedRequest[] = [];
      await page.route(
        (url: URL): boolean => url.href.startsWith(E2E_API_URL),
        async (route: Route): Promise<void> => {
          unstubbed.push(`${route.request().method()} ${route.request().url()}`);
          await route.abort();
        },
      );

      await provide({
        async respond<T>(
          method: HttpMethod,
          path: string,
          body: T,
          status: number = HTTP_OK,
          headers: Record<string, string> = {},
        ): Promise<void> {
          await page.route(
            (url: URL): boolean => url.href.startsWith(E2E_API_URL) && url.pathname === path,
            async (route: Route): Promise<void> => {
              if (route.request().method() !== method) {
                await route.fallback();
                return;
              }
              answered.push(recordOf(route.request()));
              const allHeaders: Record<string, string> = { ...CORS_HEADERS, ...headers };
              if (status === HTTP_NO_CONTENT) {
                await route.fulfill({ status, headers: allHeaders });
                return;
              }
              await route.fulfill({ status, json: body, headers: allHeaders });
            },
          );
        },
        requests(method: HttpMethod, path: string): RecordedRequest[] {
          return answered.filter(
            (request: RecordedRequest): boolean =>
              request.method === method && request.url.pathname === path,
          );
        },
      });

      expect(unstubbed, "API calls without a stub").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
