import { http, HttpResponse } from "msw";
import { api } from "@/services/api";
import { CACHE_TAGS } from "@/services/cache-tags";
import type { AppStore } from "@/store";
import { apiUrl, server } from "./server";

const DASHBOARD_PROBE_PATH: string = "/dashboard-probe";

const dashboardProbeApi = api.injectEndpoints({
  endpoints: (build) => ({
    probeDashboard: build.query<null, void>({
      query: (): string => DASHBOARD_PROBE_PATH,
      providesTags: [CACHE_TAGS.DASHBOARD],
    }),
  }),
});

export function countDashboardReads(): () => number {
  let reads: number = 0;
  server.use(
    http.get(apiUrl(DASHBOARD_PROBE_PATH), () => {
      reads += 1;
      return HttpResponse.json(null);
    }),
  );
  return (): number => reads;
}

export async function openDashboard(store: AppStore): Promise<void> {
  await store.dispatch(dashboardProbeApi.endpoints.probeDashboard.initiate());
}
