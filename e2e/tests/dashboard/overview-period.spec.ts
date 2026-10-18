import type { Locator } from "@playwright/test";
import type { Dashboard } from "../../../src/@types/dashboard";
import { PERIOD_PARAM } from "../../../src/pages/dashboard/overview/constants";
import {
  CHART_TITLES,
  DASHBOARD_MESSAGES,
  PERIOD_LABELS,
} from "../../../src/pages/dashboard/overview/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import {
  dailyBuckets,
  dashboardPeriods,
  dashboardResponse,
  dashboardSection,
  kpiCard,
  periodOption,
  stubDashboard,
  weekDashboard,
} from "../../support/dashboard";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import { stubSession } from "../../support/session";

const KEY_HOLD_MS: number = 100;

const THIRTY_DAYS: readonly number[] = Array.from(
  { length: 30 },
  (_day: unknown, index: number): number => index + 30,
);

const MONTH: Dashboard = dashboardResponse({
  period: "LAST_30_DAYS",
  orders: { count: 1284, previousCount: 1310, changePercent: -2 },
  revenue: 74118.4,
  ordersOverTime: { granularity: "DAY", points: dailyBuckets(THIRTY_DAYS) },
});

function periodInAddress(period: string): (url: URL) => boolean {
  return (url: URL): boolean =>
    url.pathname === SCREEN_URLS.DASHBOARD && url.searchParams.get(PERIOD_PARAM) === period;
}

test.beforeEach(async ({ api }): Promise<void> => {
  await stubSession(api, STAFF_ME);
});

test("starts on today and switches to 7 days, asking the API for them and keeping them in the address", async ({
  page,
  api,
}): Promise<void> => {
  await stubDashboard(api, dashboardResponse());
  await page.goto(SCREEN_URLS.DASHBOARD);
  await expect(periodOption(page, "TODAY")).toBeChecked();
  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toContainText("48");
  await stubDashboard(api, weekDashboard());

  await periodOption(page, "LAST_7_DAYS").click();

  await expect(page).toHaveURL(periodInAddress("LAST_7_DAYS"));
  await expect(periodOption(page, "LAST_7_DAYS")).toBeChecked();
  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toContainText("312");
  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toContainText(
    "+5,1% vs 7 dias anteriores",
  );
  const chart: Locator = dashboardSection(page, CHART_TITLES.DAY);
  await expect(
    chart.getByRole("img", {
      name: DASHBOARD_MESSAGES.CHART_LABEL(CHART_TITLES.DAY, PERIOD_LABELS.LAST_7_DAYS),
    }),
  ).toBeVisible();
  expect(dashboardPeriods(api)).toEqual(["TODAY", "LAST_7_DAYS"]);
  await expectNoHorizontalOverflow(page);
});

test("opens the period named in the address, with a fall shown against the previous 30 days", async ({
  page,
  api,
}): Promise<void> => {
  await stubDashboard(api, MONTH);

  await page.goto(`${SCREEN_URLS.DASHBOARD}?${PERIOD_PARAM}=LAST_30_DAYS`);

  await expect(periodOption(page, "LAST_30_DAYS")).toBeChecked();
  const orders: Locator = kpiCard(page, DASHBOARD_MESSAGES.ORDERS);
  await expect(orders).toContainText("1.284");
  await expect(orders).toContainText("-2% vs 30 dias anteriores");
  await expect(
    dashboardSection(page, CHART_TITLES.DAY).getByRole("table").getByRole("row"),
  ).toHaveCount(THIRTY_DAYS.length + 1);
  expect(dashboardPeriods(api)).toEqual(["LAST_30_DAYS"]);
  await expectNoHorizontalOverflow(page);
});

test("falls back to today when the address names a period the API does not know", async ({
  page,
  api,
}): Promise<void> => {
  await stubDashboard(api, dashboardResponse());

  await page.goto(`${SCREEN_URLS.DASHBOARD}?${PERIOD_PARAM}=hoje`);

  await expect(periodOption(page, "TODAY")).toBeChecked();
  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toContainText("48");
  expect(dashboardPeriods(api)).toEqual(["TODAY"]);
});

test("moves between periods with the arrow keys", async ({ page, api }): Promise<void> => {
  await stubDashboard(api, dashboardResponse());
  await page.goto(SCREEN_URLS.DASHBOARD);
  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toContainText("48");
  await stubDashboard(api, weekDashboard());
  await periodOption(page, "TODAY").focus();

  await page.keyboard.press("ArrowRight", { delay: KEY_HOLD_MS });

  await expect(periodOption(page, "LAST_7_DAYS")).toBeChecked();
  await expect(page).toHaveURL(periodInAddress("LAST_7_DAYS"));
});
