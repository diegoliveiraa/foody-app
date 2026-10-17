import type { Locator, Page } from "@playwright/test";
import type { StaffOrder } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import {
  CANCELLATION_REASON_LABELS,
  CANCELLED_BY_LABELS,
  ORDER_STATUS_LABELS,
} from "../../../src/constants/orders";
import { ORDER_DETAIL_MESSAGES } from "../../../src/pages/orders/order-list/detail/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { formatClock, formatOrderTime } from "../../../src/utils/format-order-date";
import { HTTP_METHODS, HTTP_NOT_FOUND, SCREEN_URLS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import {
  CLOCK_START,
  installClock,
  LIVE_POLL,
  minutesBefore,
  orderId,
  orderPath,
  orderUrl,
  staffActionsFor,
  staffOrder,
  staffPage,
  stubOrder,
  stubOrders,
} from "../../support/orders";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const PLACED_AT: string = minutesBefore(28);

const STARTED_AT: string = minutesBefore(25);

const PREPARING: StaffOrder = staffOrder(1042, {
  status: "PREPARING",
  placedAt: PLACED_AT,
  customer: { id: orderId(1), name: "Ana P.", email: "ana@foody.dev" },
  items: [
    {
      productId: orderId(11),
      productName: "Smash duplo",
      unitPrice: 34.9,
      quantity: 1,
      subtotal: 34.9,
    },
    {
      productId: orderId(12),
      productName: "Limonada da casa",
      unitPrice: 12,
      quantity: 2,
      subtotal: 24,
    },
  ],
  total: 58.9,
  history: [
    {
      fromStatus: null,
      toStatus: "RECEIVED",
      actorSide: "CUSTOMER",
      actorName: "Ana P.",
      occurredAt: PLACED_AT,
    },
    {
      fromStatus: "RECEIVED",
      toStatus: "PREPARING",
      actorSide: "RESTAURANT",
      actorName: "Carlos M.",
      occurredAt: STARTED_AT,
    },
  ],
});

const CANCELLED: StaffOrder = {
  ...PREPARING,
  ...staffActionsFor("CANCELLED"),
  status: "CANCELLED",
  live: false,
  cancellation: { cancelledBy: "RESTAURANT", reason: "STORE_CLOSED", note: "Gás acabou" },
};

function historyEntries(page: Page): Locator {
  return page.getByRole("region", { name: ORDER_DETAIL_MESSAGES.HISTORY }).getByRole("listitem");
}

function readsOf(api: ApiStubs): number {
  return api.requests(HTTP_METHODS.GET, orderPath(PREPARING.id)).length;
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, STAFF_ME);
});

test("shows the order, its customer, items, address and history newest first", async ({
  page,
  api,
}): Promise<void> => {
  await stubOrder(api, PREPARING);

  await page.goto(orderUrl(PREPARING.id));

  await expect(
    page.getByRole("heading", { name: ORDER_DETAIL_MESSAGES.TITLE(1042, "Ana P.") }),
  ).toBeVisible();
  await expect(
    page.getByText(
      ORDER_DETAIL_MESSAGES.PLACED(
        formatOrderTime(PLACED_AT, CLOCK_START.getTime()),
        ORDER_DETAIL_MESSAGES.UNITS(3),
      ),
    ),
  ).toBeVisible();
  await expect(page.getByText(ORDER_STATUS_LABELS.PREPARING, { exact: true })).toBeVisible();
  await expect(page.getByText("ana@foody.dev")).toBeVisible();
  await expect(page.getByRole("region", { name: MESSAGES.ORDERS.ITEMS })).toContainText(
    formatMoney(58.9),
  );
  await expect(page.getByText("Avenida Paulista, 1000 · Apto 42")).toBeVisible();
  await expect(historyEntries(page)).toHaveText([
    `${ORDER_DETAIL_MESSAGES.STATUS_CHANGE(ORDER_STATUS_LABELS.RECEIVED, ORDER_STATUS_LABELS.PREPARING)}${ORDER_DETAIL_MESSAGES.ACTOR(formatClock(STARTED_AT), "Carlos M.", "equipe")}`,
    `${ORDER_DETAIL_MESSAGES.CREATED}${ORDER_DETAIL_MESSAGES.ACTOR(formatClock(PLACED_AT), "Ana P.", "cliente")}`,
  ]);
  await expectNoHorizontalOverflow(page);
});

test("shows who cancelled the order, why, and the note", async ({ page, api }): Promise<void> => {
  await stubOrder(api, CANCELLED);

  await page.goto(orderUrl(CANCELLED.id));

  const cancellation: Locator = page.getByRole("region", { name: MESSAGES.ORDERS.CANCELLED_TITLE });
  await expect(cancellation).toContainText(CANCELLED_BY_LABELS.RESTAURANT);
  await expect(cancellation).toContainText(
    MESSAGES.ORDERS.REASON(CANCELLATION_REASON_LABELS.STORE_CLOSED),
  );
  await expect(cancellation).toContainText("Gás acabou");
  await expectNoHorizontalOverflow(page);
});

test("asks again every 30 seconds while the order is live, and stops once it is not", async ({
  page,
  api,
}): Promise<void> => {
  await stubOrder(api, PREPARING);
  await page.goto(orderUrl(PREPARING.id));
  await expect(page.getByText(ORDER_STATUS_LABELS.PREPARING, { exact: true })).toBeVisible();
  await stubOrder(api, CANCELLED);

  await page.clock.fastForward(LIVE_POLL);
  await expect(page.getByText(ORDER_STATUS_LABELS.CANCELLED, { exact: true })).toBeVisible();
  await page.clock.fastForward(LIVE_POLL);
  await page.clock.fastForward(LIVE_POLL);

  await expect(page.getByText(CANCELLED_BY_LABELS.RESTAURANT)).toBeVisible();
  expect(readsOf(api)).toBe(2);
});

test("tells staff when the order does not exist, with a way back to the board", async ({
  page,
  api,
}): Promise<void> => {
  const unknown: string = orderId(9999);
  await api.respond(
    HTTP_METHODS.GET,
    orderPath(unknown),
    problem(HTTP_NOT_FOUND, "ORDER_NOT_FOUND", "Pedido não encontrado"),
    HTTP_NOT_FOUND,
  );
  await stubOrders(api, staffPage([]));
  await page.goto(orderUrl(unknown));
  await expect(page.getByText(MESSAGES.ORDERS.NOT_FOUND)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("link", { name: ORDER_DETAIL_MESSAGES.BACK }).last().click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ORDERS));
});
