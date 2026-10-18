import type { Locator } from "@playwright/test";
import type { MeModule, MeResponse } from "../../../src/@types/me";
import type { StaffOrderSummary } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { MODULE_KEYS } from "../../../src/constants/screens";
import { openBackofficeNavigation } from "../../support/backoffice";
import { SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { dashboardResponse, stubDashboard } from "../../support/dashboard";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, isMobileViewport } from "../../support/layout";
import { ME_LABELS, STAFF_ME } from "../../support/me";
import {
  installClock,
  LIVE_POLL,
  orderQueries,
  staffPage,
  staffSummary,
  stubOrders,
} from "../../support/orders";
import { stubSession } from "../../support/session";

const STAFF_WITHOUT_ORDERS: MeResponse = {
  ...STAFF_ME,
  modules: STAFF_ME.modules.filter(
    (module: MeModule): boolean => module.key !== MODULE_KEYS.ORDERS,
  ),
};

const WAITING: StaffOrderSummary = staffSummary(1043);

const NEW_ORDER: StaffOrderSummary = staffSummary(1045, { customerName: "Rafael T." });

function ordersItem(navigation: Locator): Locator {
  return navigation.getByRole("listitem").filter({
    has: navigation.page().getByRole("link", { name: ME_LABELS.ORDER_LIST, exact: true }),
  });
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubDashboard(api, dashboardResponse());
});

test("counts every active order next to Pedidos, from the total the board reports", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubOrders(api, staffPage([staffSummary(1043)], { totalItems: 134 }));
  await page.goto(SCREEN_URLS.DASHBOARD);

  const navigation: Locator = await openBackofficeNavigation(page);

  const item: Locator = ordersItem(navigation);
  await expect(item.getByText("134", { exact: true })).toBeVisible();
  await expect(item.getByText(MESSAGES.NAVIGATION.ACTIVE_ORDERS(134))).toBeAttached();
  await expectNoHorizontalOverflow(page);
});

test("keeps the count up to date every 30 seconds", async ({ page, api }): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubOrders(api, staffPage([staffSummary(1043)], { totalItems: 2 }));
  await page.goto(SCREEN_URLS.DASHBOARD);
  const navigation: Locator = await openBackofficeNavigation(page);
  await expect(ordersItem(navigation).getByText("2", { exact: true })).toBeVisible();
  await stubOrders(api, staffPage([staffSummary(1043)], { totalItems: 3 }));

  await page.clock.fastForward(LIVE_POLL);

  await expect(ordersItem(navigation).getByText("3", { exact: true })).toBeVisible();
});

test("shares the board's request on the orders screen instead of asking twice", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubOrders(api, staffPage([staffSummary(1043)], { totalItems: 6 }));
  await page.goto(SCREEN_URLS.ORDERS);

  const navigation: Locator = await openBackofficeNavigation(page);

  await expect(ordersItem(navigation).getByText("6", { exact: true })).toBeVisible();
  expect(orderQueries(api)).toHaveLength(1);
});

test("hides the count when no order is active", async ({ page, api }): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await page.goto(SCREEN_URLS.DASHBOARD);

  const navigation: Locator = await openBackofficeNavigation(page);

  await expect.poll((): number => orderQueries(api).length).toBe(1);
  await expect(ordersItem(navigation)).toBeVisible();
  await expect(navigation.getByText(MESSAGES.NAVIGATION.ACTIVE_ORDERS(0))).toHaveCount(0);
  await expect(ordersItem(navigation).getByText("0", { exact: true })).toHaveCount(0);
});

test("keeps the count and the new-order toast live on a phone, away from the board, with the menu closed", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(!isMobileViewport(page), SKIP_REASONS.PHONES_ONLY);
  await stubSession(api, STAFF_ME);
  await stubOrders(api, staffPage([WAITING]));
  await page.goto(SCREEN_URLS.DASHBOARD);
  await expect.poll((): number => orderQueries(api).length).toBe(1);
  await stubOrders(api, staffPage([WAITING, NEW_ORDER]));

  await page.clock.fastForward(LIVE_POLL);

  await expect(page.getByText(MESSAGES.ORDERS.NEW_ORDER(NEW_ORDER.number))).toBeVisible();
  expect(orderQueries(api)).toHaveLength(2);
  await expect(page.getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN })).toHaveCount(0);
  const navigation: Locator = await openBackofficeNavigation(page);
  await expect(ordersItem(navigation).getByText("2", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("shows no count and asks for no orders when /me has no orders screen", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_WITHOUT_ORDERS);
  await page.goto(SCREEN_URLS.DASHBOARD);

  const navigation: Locator = await openBackofficeNavigation(page);

  await expect(navigation.getByRole("link", { name: ME_LABELS.PRODUCTS })).toBeVisible();
  await expect(navigation.getByRole("link", { name: ME_LABELS.ORDER_LIST })).toHaveCount(0);
  expect(orderQueries(api)).toEqual([]);
  await expectNoHorizontalOverflow(page);
});
