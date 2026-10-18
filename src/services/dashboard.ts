import type { FetchArgs } from "@reduxjs/toolkit/query";
import type { Dashboard, DashboardParams, DashboardPeriod } from "@/@types/dashboard";
import { API_PATHS } from "@/constants/api";
import { DASHBOARD_POLLING_MS } from "@/constants/orders";
import type { LivePolling } from "@/utils/live-polling";
import { api } from "./api";
import { CACHE_TAGS, type CacheTag } from "./cache-tags";

export const DASHBOARD_POLLING: LivePolling = {
  pollingInterval: DASHBOARD_POLLING_MS,
  skipPollingIfUnfocused: true,
};

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<Dashboard, DashboardPeriod>({
      query: (period: DashboardPeriod): FetchArgs => {
        const params: DashboardParams = { period };
        return { url: API_PATHS.DASHBOARD, params };
      },
      providesTags: (): CacheTag[] => [CACHE_TAGS.DASHBOARD],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
