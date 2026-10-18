import type { Locator } from "@playwright/test";
import type { Dashboard } from "../../../src/@types/dashboard";
import {
  CHART_TITLES,
  DASHBOARD_MESSAGES,
  STAGE_LABELS,
} from "../../../src/pages/dashboard/overview/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import {
  dashboardResponse,
  dashboardSection,
  hourlyBuckets,
  kpiCard,
  NO_CANCELLATIONS,
  NO_PENDING_REQUESTS,
  stubDashboard,
} from "../../support/dashboard";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import { stubSession } from "../../support/session";

const QUIET_HOURS: readonly number[] = Array.from({ length: 8 }, (): number => 0);

const QUIET_DAY: Dashboard = dashboardResponse({
  orders: { count: 0, previousCount: 0, changePercent: null },
  revenue: 0,
  averageTicket: null,
  ordersOverTime: { granularity: "HOUR", points: hourlyBuckets(QUIET_HOURS) },
  topProducts: [],
  activeByStatus: { received: 0, preparing: 0, outForDelivery: 0 },
  averageStageMinutes: {
    receivedToPreparing: null,
    preparingToOutForDelivery: null,
    outForDeliveryToDelivered: null,
  },
  cancellations: NO_CANCELLATIONS,
  pendingCancellationRequests: NO_PENDING_REQUESTS,
});

test("says what is missing in a period without orders instead of showing made-up numbers", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubDashboard(api, QUIET_DAY);

  await page.goto(SCREEN_URLS.DASHBOARD);

  const orders: Locator = kpiCard(page, DASHBOARD_MESSAGES.ORDERS);
  await expect(orders).toContainText("0");
  await expect(orders).toContainText(DASHBOARD_MESSAGES.NO_PREVIOUS_ORDERS);
  await expect(kpiCard(page, DASHBOARD_MESSAGES.AVERAGE_TICKET)).toContainText(
    DASHBOARD_MESSAGES.NOT_AVAILABLE,
  );
  const cancellations: Locator = kpiCard(page, DASHBOARD_MESSAGES.CANCELLATIONS);
  await expect(cancellations).toContainText(DASHBOARD_MESSAGES.NOT_AVAILABLE);
  await expect(cancellations).toContainText("0 de 0 pedidos");
  await expect(dashboardSection(page, DASHBOARD_MESSAGES.TOP_PRODUCTS)).toContainText(
    DASHBOARD_MESSAGES.NO_DELIVERED_ORDERS,
  );
  await expect(dashboardSection(page, DASHBOARD_MESSAGES.CANCELLATIONS)).toContainText(
    DASHBOARD_MESSAGES.NO_CANCELLATIONS,
  );
  await expect(
    dashboardSection(page, DASHBOARD_MESSAGES.STAGE_TIMES).getByRole("listitem").first(),
  ).toHaveText(`${STAGE_LABELS.receivedToPreparing}${DASHBOARD_MESSAGES.NOT_AVAILABLE}`);
  await expect(
    dashboardSection(page, CHART_TITLES.HOUR).getByRole("table").getByRole("row"),
  ).toHaveCount(QUIET_HOURS.length + 1);
  await expect(page.getByRole("link", { name: /solicita/ })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
