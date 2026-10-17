import type { Locator, Page } from "@playwright/test";
import type { CustomerOrderSummary } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { ORDER_STATUS_LABELS } from "../../../src/constants/orders";
import { MY_ORDERS_MESSAGES } from "../../../src/pages/store/my-orders/list/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { formatOrderTime } from "../../../src/utils/format-order-date";
import { HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test, type ApiStubs, type RecordedRequest } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME, ME_LABELS } from "../../support/me";
import { stubMenu } from "../../support/menu";
import {
  CLOCK_START,
  customerOrder,
  customerPage,
  customerSummary,
  installClock,
  minutesBefore,
  MY_ORDERS_PATH,
  myOrderUrl,
  stubMyOrder,
  stubMyOrders,
} from "../../support/orders";
import { stubSession } from "../../support/session";

const PREPARING: CustomerOrderSummary = customerSummary(1042, {
  status: "PREPARING",
  placedAt: minutesBefore(28),
  items: [
    { productName: "Smash duplo", quantity: 1 },
    { productName: "Limonada da casa", quantity: 2 },
  ],
  total: 58.9,
});

const DELIVERED: CustomerOrderSummary = customerSummary(1039, {
  status: "DELIVERED",
  live: false,
  placedAt: minutesBefore(24 * 60),
  total: 57.4,
});

const OLDER: CustomerOrderSummary = customerSummary(1031, {
  status: "CANCELLED",
  live: false,
  placedAt: minutesBefore(5 * 24 * 60),
  total: 52.9,
});

const FIRST_PAGE_QUERY: Record<string, string> = {
  page: "1",
  pageSize: "10",
  sort: "placedAt,desc",
};

function orderCard(page: Page, order: CustomerOrderSummary): Locator {
  return page.getByRole("link", { name: new RegExp(MESSAGES.ORDERS.TITLE(order.number)) });
}

function sentQueries(api: ApiStubs): Record<string, string>[] {
  return api
    .requests(HTTP_METHODS.GET, MY_ORDERS_PATH)
    .map((request: RecordedRequest): Record<string, string> =>
      Object.fromEntries(request.url.searchParams),
    );
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, CUSTOMER_ME);
});

test("lists the customer's orders newest first, with status, items, when and total", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrders(api, customerPage([PREPARING, DELIVERED]));

  await page.goto(SCREEN_URLS.MY_ORDERS);

  await expect(orderCard(page, PREPARING)).toContainText(ORDER_STATUS_LABELS.PREPARING);
  await expect(orderCard(page, PREPARING)).toContainText("1× Smash duplo, 2× Limonada da casa");
  await expect(orderCard(page, PREPARING)).toContainText(
    formatOrderTime(PREPARING.placedAt, CLOCK_START.getTime()),
  );
  await expect(orderCard(page, PREPARING)).toContainText(formatMoney(58.9));
  await expect(orderCard(page, DELIVERED)).toContainText(ORDER_STATUS_LABELS.DELIVERED);
  await expect(page.getByRole("button", { name: MY_ORDERS_MESSAGES.LOAD_MORE })).toHaveCount(0);
  expect(sentQueries(api)).toEqual([FIRST_PAGE_QUERY]);
  await expectNoHorizontalOverflow(page);
});

test("shows more orders on 'Ver mais pedidos' until the last page", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrders(api, customerPage([PREPARING, DELIVERED], { hasNext: true, totalPages: 2 }));
  await page.goto(SCREEN_URLS.MY_ORDERS);
  await expect(orderCard(page, DELIVERED)).toBeVisible();
  await stubMyOrders(api, customerPage([OLDER], { page: 2, totalPages: 2, hasPrevious: true }));

  await page.getByRole("button", { name: MY_ORDERS_MESSAGES.LOAD_MORE }).click();

  await expect(orderCard(page, OLDER)).toContainText(ORDER_STATUS_LABELS.CANCELLED);
  await expect(orderCard(page, PREPARING)).toBeVisible();
  await expect(page.getByRole("button", { name: MY_ORDERS_MESSAGES.LOAD_MORE })).toHaveCount(0);
  expect(sentQueries(api)).toEqual([FIRST_PAGE_QUERY, { ...FIRST_PAGE_QUERY, page: "2" }]);
  await expectNoHorizontalOverflow(page);
});

test("opens the tracking of an order from its card", async ({ page, api }): Promise<void> => {
  await stubMyOrders(api, customerPage([PREPARING]));
  await stubMyOrder(api, customerOrder(PREPARING.number, { status: "PREPARING" }));
  await page.goto(SCREEN_URLS.MY_ORDERS);

  await orderCard(page, PREPARING).click();

  await expect(page).toHaveURL(pathIs(myOrderUrl(PREPARING.id)));
  await expect(
    page.getByRole("heading", { name: MESSAGES.ORDERS.TITLE(PREPARING.number) }),
  ).toBeVisible();
});

test("invites a customer without orders to the menu", async ({ page, api }): Promise<void> => {
  await stubMyOrders(api, customerPage([]));
  await stubMenu(api);
  await page.goto(SCREEN_URLS.MY_ORDERS);
  await expect(page.getByText(MY_ORDERS_MESSAGES.EMPTY)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("link", { name: MY_ORDERS_MESSAGES.BROWSE_MENU }).click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
  await expect(page.getByRole("heading", { name: ME_LABELS.MENU, level: 1 })).toBeVisible();
});
