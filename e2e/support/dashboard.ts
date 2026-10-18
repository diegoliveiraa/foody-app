import type { Locator, Page } from "@playwright/test";
import type { Dashboard, DashboardPeriod } from "../../src/@types/dashboard";
import { API_PATHS } from "../../src/constants/api";
import {
  DASHBOARD_MESSAGES,
  PERIOD_LABELS,
} from "../../src/pages/dashboard/overview/constants/messages";
import { HTTP_METHODS } from "./constants";
import type { ApiStubs, RecordedRequest } from "./fixtures";

export {
  dailyBuckets,
  dashboardResponse,
  hourlyBuckets,
  NO_CANCELLATIONS,
  NO_PENDING_REQUESTS,
  weekDashboard,
} from "../../src/test/dashboard";

export const DASHBOARD_PATH: string = API_PATHS.DASHBOARD;

export const DASHBOARD_POLL: string = "01:00";

export async function stubDashboard(api: ApiStubs, dashboard: Dashboard): Promise<void> {
  await api.respond(HTTP_METHODS.GET, DASHBOARD_PATH, dashboard);
}

export function dashboardPeriods(api: ApiStubs): (string | null)[] {
  return api
    .requests(HTTP_METHODS.GET, DASHBOARD_PATH)
    .map((request: RecordedRequest): string | null => request.url.searchParams.get("period"));
}

export function kpiCard(page: Page, label: string): Locator {
  return page.getByRole("article", { name: label, exact: true });
}

export function dashboardSection(page: Page, title: string): Locator {
  return page.getByRole("region", { name: title, exact: true });
}

export function periodOption(page: Page, period: DashboardPeriod): Locator {
  return page
    .getByRole("radiogroup", { name: DASHBOARD_MESSAGES.PERIOD })
    .getByRole("radio", { name: PERIOD_LABELS[period], exact: true });
}
