import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MESSAGES } from "@/constants/messages";
import { meApi } from "@/services/me";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";

vi.mock("sonner", () => ({ toast: vi.fn() }));

afterEach((): void => {
  vi.clearAllMocks();
});

describe("rate limit listener", () => {
  it("shows the wait time of any rate-limited call in a toast", async () => {
    const { store }: TestStore = createTestStore();
    store.dispatch(tokenReceived("valid-token"));
    server.use(
      http.get(apiUrl("/me"), () =>
        HttpResponse.json(problem(429, "RATE_LIMITED"), {
          status: 429,
          headers: { "Retry-After": "42" },
        }),
      ),
    );

    await store.dispatch(meApi.endpoints.getMe.initiate());

    expect(toast).toHaveBeenCalledWith(MESSAGES.ERRORS.RATE_LIMITED(42), expect.anything());
  });

  it("stays quiet for failures that are not rate limits", async () => {
    const { store }: TestStore = createTestStore();
    store.dispatch(tokenReceived("valid-token"));
    server.use(
      http.get(apiUrl("/me"), () => HttpResponse.json(problem(403, "FORBIDDEN"), { status: 403 })),
    );

    await store.dispatch(meApi.endpoints.getMe.initiate());

    expect(toast).not.toHaveBeenCalled();
  });
});
