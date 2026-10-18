import type { Locator } from "@playwright/test";
import type { StaffOrder } from "../../../src/@types/orders";
import { BOARD_TAB_LABELS } from "../../../src/constants/orders";
import {
  CHART_TITLES,
  DASHBOARD_MESSAGES,
  PERIOD_LABELS,
  STAGE_LABELS,
} from "../../../src/pages/dashboard/overview/constants/messages";
import { ORDER_DETAIL_MESSAGES } from "../../../src/pages/orders/order-list/detail/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { SCREEN_URLS } from "../../support/constants";
import {
  dashboardPeriods,
  dashboardResponse,
  dashboardSection,
  kpiCard,
  stubDashboard,
} from "../../support/dashboard";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import { orderId, orderUrl, staffOrder, stubOrder } from "../../support/orders";
import { stubSession } from "../../support/session";

const HOURS_WITH_ORDERS: number = 9;

test.beforeEach(async ({ api }): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubDashboard(api, dashboardResponse());
});

test("shows the period's indicators from the API's numbers, with when they were generated", async ({
  page,
  api,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.DASHBOARD);

  await expect(
    page.getByRole("heading", { level: 1, name: DASHBOARD_MESSAGES.TITLE }),
  ).toBeVisible();
  await expect(page.getByText(DASHBOARD_MESSAGES.UPDATED_AT("19:42"))).toBeAttached();
  const orders: Locator = kpiCard(page, DASHBOARD_MESSAGES.ORDERS);
  await expect(orders).toContainText("48");
  await expect(orders).toContainText("+12% vs ontem");
  await expect(kpiCard(page, DASHBOARD_MESSAGES.REVENUE)).toContainText(formatMoney(2847.6));
  await expect(kpiCard(page, DASHBOARD_MESSAGES.AVERAGE_TICKET)).toContainText(formatMoney(59.32));
  const cancellations: Locator = kpiCard(page, DASHBOARD_MESSAGES.CANCELLATIONS);
  await expect(cancellations).toContainText("4,2%");
  await expect(cancellations).toContainText("2 de 48 pedidos");
  expect(dashboardPeriods(api)).toEqual(["TODAY"]);
  await expectNoHorizontalOverflow(page);
});

test("draws today's orders per hour from the first hour with orders, with the numbers in a table", async ({
  page,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.DASHBOARD);

  const chart: Locator = dashboardSection(page, CHART_TITLES.HOUR);
  const label: string = DASHBOARD_MESSAGES.CHART_LABEL(CHART_TITLES.HOUR, PERIOD_LABELS.TODAY);
  const image: Locator = chart.getByRole("img", { name: label });
  await expect(image).toBeVisible();
  await expect(image.locator("svg").first()).toBeVisible();
  const table: Locator = chart.getByRole("table", { name: label });
  await expect(table.getByRole("row")).toHaveCount(HOURS_WITH_ORDERS + 1);
  await expect(table.getByRole("row").nth(1)).toHaveText("11h2");
  await expectNoHorizontalOverflow(page);
});

test("shows the live counts, the time per stage, the best sellers and the cancellations", async ({
  page,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.DASHBOARD);

  const now: Locator = dashboardSection(page, DASHBOARD_MESSAGES.NOW);
  await expect(
    now.getByRole("link", {
      name: DASHBOARD_MESSAGES.ACTIVE_COUNT("3", BOARD_TAB_LABELS.RECEIVED),
    }),
  ).toBeVisible();
  await expect(
    now.getByRole("link", {
      name: DASHBOARD_MESSAGES.ACTIVE_COUNT("2", BOARD_TAB_LABELS.PREPARING),
    }),
  ).toBeVisible();
  await expect(
    now.getByRole("link", {
      name: DASHBOARD_MESSAGES.ACTIVE_COUNT("1", BOARD_TAB_LABELS.OUT_FOR_DELIVERY),
    }),
  ).toBeVisible();
  const stages: Locator = dashboardSection(page, DASHBOARD_MESSAGES.STAGE_TIMES);
  await expect(stages.getByRole("listitem").nth(0)).toHaveText(
    `${STAGE_LABELS.receivedToPreparing}3 min`,
  );
  await expect(stages.getByRole("listitem").nth(2)).toHaveText(
    `${STAGE_LABELS.outForDeliveryToDelivered}22 min`,
  );
  const products: Locator = dashboardSection(page, DASHBOARD_MESSAGES.TOP_PRODUCTS);
  await expect(products.getByRole("listitem")).toHaveCount(3);
  await expect(products.getByRole("listitem").first()).toContainText("Smash duplo");
  await expect(products.getByRole("listitem").first()).toContainText("21 un");
  await expect(products.getByRole("listitem").first()).toContainText(formatMoney(732.9));
  const cancellations: Locator = dashboardSection(page, DASHBOARD_MESSAGES.CANCELLATIONS);
  await expect(cancellations).toContainText("4,2% no período");
  await expect(cancellations.getByRole("listitem").first()).toHaveText("Está demorando · cliente1");
  await expect(cancellations.getByRole("listitem").nth(1)).toHaveText(
    "Item indisponível · equipe1",
  );
  await expectNoHorizontalOverflow(page);
});

test("leads from the live counts to the board", async ({ page }): Promise<void> => {
  await page.goto(SCREEN_URLS.DASHBOARD);

  await dashboardSection(page, DASHBOARD_MESSAGES.NOW)
    .getByRole("link", { name: DASHBOARD_MESSAGES.ACTIVE_COUNT("3", BOARD_TAB_LABELS.RECEIVED) })
    .click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ORDERS));
});

test("leads the pending requests banner to the oldest order waiting for a decision", async ({
  page,
  api,
}): Promise<void> => {
  const oldest: StaffOrder = staffOrder(1038);
  await stubOrder(api, oldest);
  await page.goto(SCREEN_URLS.DASHBOARD);
  const banner: Locator = page.getByRole("link", {
    name: DASHBOARD_MESSAGES.PENDING_REQUESTS(2),
  });
  await expect(banner).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await banner.click();

  await expect(page).toHaveURL(pathIs(orderUrl(orderId(1038))));
  await expect(
    page.getByRole("heading", {
      name: ORDER_DETAIL_MESSAGES.TITLE(1038, oldest.customer.name),
    }),
  ).toBeVisible();
});
