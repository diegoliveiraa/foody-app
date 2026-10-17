import type { Locator, Page } from "@playwright/test";
import type { CustomerOrder } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import {
  CANCELLATION_REASON_LABELS,
  CANCELLED_BY_LABELS,
  ORDER_STATUS_LABELS,
} from "../../../src/constants/orders";
import { TRACKING_MESSAGES } from "../../../src/pages/store/my-orders/detail/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { formatClock } from "../../../src/utils/format-order-date";
import { HTTP_METHODS, HTTP_NOT_FOUND } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import {
  customerActionsFor,
  customerOrder,
  installClock,
  LIVE_POLL,
  minutesBefore,
  myOrderPath,
  myOrderUrl,
  orderId,
  stubMyOrder,
} from "../../support/orders";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const RECEIVED_AT: string = minutesBefore(28);

const PREPARING_AT: string = minutesBefore(25);

const PREPARING: CustomerOrder = customerOrder(1042, {
  status: "PREPARING",
  placedAt: RECEIVED_AT,
  history: [
    { fromStatus: null, toStatus: "RECEIVED", actorSide: "CUSTOMER", occurredAt: RECEIVED_AT },
    {
      fromStatus: "RECEIVED",
      toStatus: "PREPARING",
      actorSide: "RESTAURANT",
      occurredAt: PREPARING_AT,
    },
  ],
});

const DELIVERED: CustomerOrder = {
  ...PREPARING,
  ...customerActionsFor("DELIVERED"),
  status: "DELIVERED",
  live: false,
};

const CANCELLED: CustomerOrder = {
  ...PREPARING,
  ...customerActionsFor("CANCELLED"),
  status: "CANCELLED",
  live: false,
  cancellation: { cancelledBy: "RESTAURANT", reason: "ITEM_UNAVAILABLE", note: null },
};

function timeline(page: Page): Locator {
  return page.getByRole("list", { name: TRACKING_MESSAGES.TIMELINE });
}

function step(page: Page, label: string): Locator {
  return timeline(page).getByRole("listitem").filter({ hasText: label });
}

function readsOf(api: ApiStubs, order: CustomerOrder): number {
  return api.requests(HTTP_METHODS.GET, myOrderPath(order.id)).length;
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, CUSTOMER_ME);
});

test("follows the order on a timeline with the time of each step it reached", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrder(api, PREPARING);

  await page.goto(myOrderUrl(PREPARING.id));

  await expect(page.getByRole("heading", { name: MESSAGES.ORDERS.TITLE(1042) })).toBeVisible();
  await expect(page.getByText(TRACKING_MESSAGES.STATUS_NOW)).toBeVisible();
  await expect(page.getByText(TRACKING_MESSAGES.LIVE)).toBeVisible();
  await expect(step(page, ORDER_STATUS_LABELS.RECEIVED)).toContainText(formatClock(RECEIVED_AT));
  await expect(step(page, ORDER_STATUS_LABELS.PREPARING)).toContainText(formatClock(PREPARING_AT));
  await expect(step(page, ORDER_STATUS_LABELS.PREPARING)).toHaveAttribute("aria-current", "step");
  await expect(timeline(page).getByRole("listitem")).toHaveCount(4);
  await expect(page.getByRole("region", { name: MESSAGES.ORDERS.ITEMS })).toContainText(
    formatMoney(PREPARING.total),
  );
  await expect(page.getByText("Avenida Paulista, 1000 · Apto 42")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("asks again every 30 seconds while the order is live, and stops once it is not", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrder(api, PREPARING);
  await page.goto(myOrderUrl(PREPARING.id));
  await expect(page.getByText(TRACKING_MESSAGES.LIVE)).toBeVisible();
  await stubMyOrder(api, DELIVERED);

  await page.clock.fastForward(LIVE_POLL);
  await expect(step(page, ORDER_STATUS_LABELS.DELIVERED)).toHaveAttribute("aria-current", "step");
  await page.clock.fastForward(LIVE_POLL);
  await page.clock.fastForward(LIVE_POLL);

  await expect(page.getByText(TRACKING_MESSAGES.LIVE)).toHaveCount(0);
  expect(readsOf(api, PREPARING)).toBe(2);
});

test("shows who cancelled the order and why instead of the timeline", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrder(api, CANCELLED);

  await page.goto(myOrderUrl(CANCELLED.id));

  await expect(page.getByText(ORDER_STATUS_LABELS.CANCELLED, { exact: true })).toBeVisible();
  await expect(page.getByText(CANCELLED_BY_LABELS.RESTAURANT)).toBeVisible();
  await expect(
    page.getByText(MESSAGES.ORDERS.REASON(CANCELLATION_REASON_LABELS.ITEM_UNAVAILABLE)),
  ).toBeVisible();
  await expect(timeline(page)).toHaveCount(0);
  await expect(page.getByText(TRACKING_MESSAGES.LIVE)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("tells the customer when the order does not exist", async ({ page, api }): Promise<void> => {
  const unknown: string = orderId(9999);
  await api.respond(
    HTTP_METHODS.GET,
    myOrderPath(unknown),
    problem(HTTP_NOT_FOUND, "ORDER_NOT_FOUND", "Pedido não encontrado"),
    HTTP_NOT_FOUND,
  );

  await page.goto(myOrderUrl(unknown));

  await expect(page.getByText(MESSAGES.ORDERS.NOT_FOUND)).toBeVisible();
  await expect(page.getByRole("link", { name: TRACKING_MESSAGES.BACK_TO_LIST })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
