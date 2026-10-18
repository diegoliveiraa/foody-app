import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { Dashboard } from "@/@types/dashboard";
import { tokenReceived } from "@/store/slices/session";
import { weekDashboard } from "@/test/dashboard";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { CACHE_TAGS } from "./cache-tags";
import { DASHBOARD_POLLING, dashboardApi } from "./dashboard";

const WEEK: Dashboard = weekDashboard();

function signedInStore(): TestStore {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  return testStore;
}

function recordDashboardRequests(): URL[] {
  const urls: URL[] = [];
  server.use(
    http.get(apiUrl("/dashboard"), ({ request }) => {
      urls.push(new URL(request.url));
      return HttpResponse.json(WEEK);
    }),
  );
  return urls;
}

describe("dashboard service", () => {
  it("asks for the overview of the period it was given", async () => {
    const urls: URL[] = recordDashboardRequests();
    const { store }: TestStore = signedInStore();

    const overview: Dashboard = await store
      .dispatch(dashboardApi.endpoints.getDashboard.initiate("LAST_7_DAYS"))
      .unwrap();

    expect(overview).toEqual(WEEK);
    expect(
      urls.map((url: URL): Record<string, string> => Object.fromEntries(url.searchParams)),
    ).toEqual([{ period: "LAST_7_DAYS" }]);
  });

  it("tags the overview as the dashboard, so every order write refreshes it", async () => {
    recordDashboardRequests();
    const { store }: TestStore = signedInStore();

    await store.dispatch(dashboardApi.endpoints.getDashboard.initiate("TODAY"));

    expect(dashboardApi.util.selectInvalidatedBy(store.getState(), [CACHE_TAGS.DASHBOARD])).toEqual(
      [expect.objectContaining({ endpointName: "getDashboard", originalArgs: "TODAY" })],
    );
  });

  it("polls every 60 seconds, only while the window has focus", () => {
    expect(DASHBOARD_POLLING).toEqual({ pollingInterval: 60_000, skipPollingIfUnfocused: true });
  });
});
