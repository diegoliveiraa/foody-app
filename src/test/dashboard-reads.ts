import { http, HttpResponse } from "msw";
import { dashboardApi } from "@/services/dashboard";
import type { AppStore } from "@/store";
import { dashboardResponse } from "./dashboard";
import { apiUrl, server } from "./server";

export function countDashboardReads(): () => number {
  let reads: number = 0;
  server.use(
    http.get(apiUrl("/dashboard"), () => {
      reads += 1;
      return HttpResponse.json(dashboardResponse());
    }),
  );
  return (): number => reads;
}

export async function openDashboard(store: AppStore): Promise<void> {
  await store.dispatch(dashboardApi.endpoints.getDashboard.initiate("TODAY"));
}
