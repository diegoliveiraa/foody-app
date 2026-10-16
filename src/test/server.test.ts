import { http, HttpResponse } from "msw";
import { describe, expect, it, vi, type MockInstance } from "vitest";
import { apiUrl, server } from "./server";

describe("API mock server", () => {
  it("answers a request with the handler the test registered", async () => {
    server.use(http.get(apiUrl("/ping"), () => HttpResponse.json({ pong: true })));

    const response: Response = await fetch(apiUrl("/ping"));

    expect(await response.json()).toEqual({ pong: true });
  });

  it("makes MSW fail a request that no handler answers", async () => {
    const silencedError: MockInstance = vi.spyOn(console, "error").mockImplementation(() => {});

    const unanswered: Promise<Response> = fetch(apiUrl("/nobody-answers"));

    await expect(unanswered).rejects.toMatchObject({
      cause: { message: expect.stringContaining("[MSW]") },
    });
    silencedError.mockRestore();
  });

  it("points every request at the fixed test origin", () => {
    const url: string = apiUrl("/orders");

    expect(url).toBe("http://api.test/orders");
  });
});
