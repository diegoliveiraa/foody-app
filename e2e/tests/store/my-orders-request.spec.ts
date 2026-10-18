import type { Locator, Page } from "@playwright/test";
import type { CustomerOrderSummary } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { MY_ORDERS_MESSAGES } from "../../../src/pages/store/my-orders/list/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import {
  customerPage,
  customerSummary,
  installClock,
  minutesBefore,
  stubMyOrders,
} from "../../support/orders";
import { stubSession } from "../../support/session";

const WAITING: CustomerOrderSummary = customerSummary(1042, {
  status: "PREPARING",
  placedAt: minutesBefore(28),
  cancellationRequestStatus: "PENDING",
});

const DECLINED: CustomerOrderSummary = customerSummary(1040, {
  status: "OUT_FOR_DELIVERY",
  placedAt: minutesBefore(50),
  cancellationRequestStatus: "DECLINED",
});

const APPROVED: CustomerOrderSummary = customerSummary(1036, {
  status: "CANCELLED",
  live: false,
  placedAt: minutesBefore(90),
  cancellationRequestStatus: "APPROVED",
});

const DECLINED_THEN_DELIVERED: CustomerOrderSummary = customerSummary(1033, {
  status: "DELIVERED",
  live: false,
  placedAt: minutesBefore(2 * 24 * 60),
  cancellationRequestStatus: "DECLINED",
});

const PLAIN: CustomerOrderSummary = customerSummary(1031, {
  status: "DELIVERED",
  live: false,
  placedAt: minutesBefore(3 * 24 * 60),
});

function orderCard(page: Page, order: CustomerOrderSummary): Locator {
  return page.getByRole("link", { name: new RegExp(MESSAGES.ORDERS.TITLE(order.number)) });
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, CUSTOMER_ME);
  await stubMyOrders(
    api,
    customerPage([WAITING, DECLINED, APPROVED, DECLINED_THEN_DELIVERED, PLAIN]),
  );
});

test("tells on the card that a cancellation request waits for the restaurant", async ({
  page,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.MY_ORDERS);

  await expect(orderCard(page, WAITING)).toContainText(MY_ORDERS_MESSAGES.REQUEST_PENDING);
  await expectNoHorizontalOverflow(page);
});

test("tells on the card that the restaurant declined the cancellation", async ({
  page,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.MY_ORDERS);

  await expect(orderCard(page, DECLINED)).toContainText(MESSAGES.ORDERS.CANCELLATION_DECLINED);
  await expect(orderCard(page, DECLINED)).not.toContainText(MY_ORDERS_MESSAGES.REQUEST_PENDING);
});

test("stops telling about the declined cancellation once the order was delivered", async ({
  page,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.MY_ORDERS);

  await expect(orderCard(page, DECLINED_THEN_DELIVERED)).toBeVisible();
  await expect(orderCard(page, DECLINED_THEN_DELIVERED)).not.toContainText(
    MESSAGES.ORDERS.CANCELLATION_DECLINED,
  );
  await expect(orderCard(page, DECLINED)).toContainText(MESSAGES.ORDERS.CANCELLATION_DECLINED);
  await expectNoHorizontalOverflow(page);
});

test("adds nothing to an order cancelled on request or never asked about", async ({
  page,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.MY_ORDERS);

  for (const order of [APPROVED, PLAIN]) {
    await expect(orderCard(page, order)).toBeVisible();
    await expect(orderCard(page, order)).not.toContainText(MY_ORDERS_MESSAGES.REQUEST_PENDING);
    await expect(orderCard(page, order)).not.toContainText(MESSAGES.ORDERS.CANCELLATION_DECLINED);
  }
});
