import { MESSAGES } from "../../../src/constants/messages";
import { DASHBOARD_MESSAGES } from "../../../src/pages/dashboard/overview/constants/messages";
import { HTTP_INTERNAL_ERROR, HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import {
  DASHBOARD_PATH,
  DASHBOARD_POLL,
  dashboardPeriods,
  dashboardResponse,
  kpiCard,
  stubDashboard,
} from "../../support/dashboard";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import { installClock } from "../../support/orders";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const UNEXPECTED_DETAIL: string = "Erro inesperado";

test.beforeEach(async ({ api }): Promise<void> => {
  await stubSession(api, STAFF_ME);
});

test("asks for the numbers again on Recarregar indicadores", async ({
  page,
  api,
}): Promise<void> => {
  await stubDashboard(api, dashboardResponse());
  await page.goto(SCREEN_URLS.DASHBOARD);
  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toContainText("48");

  await page.getByRole("button", { name: DASHBOARD_MESSAGES.RELOAD_LABEL }).click();

  await expect.poll((): (string | null)[] => dashboardPeriods(api)).toEqual(["TODAY", "TODAY"]);
  await expect(page.getByRole("button", { name: DASHBOARD_MESSAGES.RELOAD_LABEL })).toBeEnabled();
  await expectNoHorizontalOverflow(page);
});

test("asks for the numbers again every 60 seconds", async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubDashboard(api, dashboardResponse());
  await page.goto(SCREEN_URLS.DASHBOARD);
  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toContainText("48");
  await stubDashboard(
    api,
    dashboardResponse({ orders: { count: 49, previousCount: 43, changePercent: 14 } }),
  );

  await page.clock.fastForward(DASHBOARD_POLL);

  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toContainText("49");
  expect(dashboardPeriods(api)).toEqual(["TODAY", "TODAY"]);
});

test("tells why the numbers could not be loaded and tries again", async ({
  page,
  api,
}): Promise<void> => {
  await api.respond(
    HTTP_METHODS.GET,
    DASHBOARD_PATH,
    problem(HTTP_INTERNAL_ERROR, "INTERNAL_ERROR", UNEXPECTED_DETAIL),
    HTTP_INTERNAL_ERROR,
  );
  await page.goto(SCREEN_URLS.DASHBOARD);
  await expect(page.getByText(DASHBOARD_MESSAGES.LOAD_FAILED)).toBeVisible();
  await expect(page.getByText(UNEXPECTED_DETAIL)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await stubDashboard(api, dashboardResponse());

  await page.getByRole("button", { name: MESSAGES.ACTIONS.RETRY }).click();

  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toContainText("48");
});
