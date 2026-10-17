import type { Locator, Page } from "@playwright/test";
import type { StaffOrder, StaffOrderPage } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { BOARD_COLUMN_LABELS, BOARD_TAB_LABELS } from "../../../src/constants/orders";
import { EMPTY_COLUMN_MESSAGES } from "../../../src/pages/orders/order-list/board/constants/messages";
import { ORDER_LIST_MESSAGES } from "../../../src/pages/orders/order-list/constants/messages";
import { ORDER_DETAIL_MESSAGES } from "../../../src/pages/orders/order-list/detail/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs, showsListCards } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import {
  boardCard,
  installClock,
  minutesBefore,
  orderQueries,
  orderUrl,
  staffOrder,
  staffPage,
  staffSummary,
  stubOrder,
  stubOrders,
} from "../../support/orders";
import { stubSession } from "../../support/session";

const BOARD: StaffOrderPage = staffPage([
  staffSummary(1038, {
    status: "OUT_FOR_DELIVERY",
    customerName: "Paulo T.",
    placedAt: minutesBefore(40),
  }),
  staffSummary(1042, {
    status: "PREPARING",
    customerName: "Ana P.",
    placedAt: minutesBefore(29),
    items: [
      { productName: "Smash duplo", quantity: 1 },
      { productName: "Limonada da casa", quantity: 2 },
    ],
    total: 58.9,
  }),
  staffSummary(1043, { customerName: "Bruna S.", placedAt: minutesBefore(2) }),
  staffSummary(1044, { customerName: "Diego M.", placedAt: minutesBefore(0) }),
]);

function tab(page: Page, label: string): Locator {
  return page.getByRole("tab", { name: new RegExp(label) });
}

function column(page: Page, label: string): Locator {
  return page.getByRole("region", { name: label, exact: true });
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, STAFF_ME);
  await stubOrders(api, BOARD);
});

test("asks for every active order in a single request", async ({ page, api }): Promise<void> => {
  await page.goto(SCREEN_URLS.ORDERS);

  await expect(boardCard(page, 1043)).toBeVisible();
  const queries: URLSearchParams[] = orderQueries(api);
  expect(queries).toHaveLength(1);
  expect(queries[0]?.getAll("status")).toEqual(["RECEIVED", "PREPARING", "OUT_FOR_DELIVERY"]);
  expect(queries[0]?.get("pageSize")).toBe("100");
  expect(queries[0]?.get("sort")).toBe("placedAt,asc");
});

test("splits the board into tabs with their counts below 1024px", async ({
  page,
}): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await page.goto(SCREEN_URLS.ORDERS);

  await expect(tab(page, `${BOARD_TAB_LABELS.RECEIVED} 2`)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(tab(page, `${BOARD_TAB_LABELS.PREPARING} 1`)).toBeVisible();
  await expect(tab(page, `${BOARD_TAB_LABELS.OUT_FOR_DELIVERY} 1`)).toBeVisible();
  await expect(boardCard(page, 1043)).toContainText("Bruna S.");
  await expect(boardCard(page, 1043)).toContainText(MESSAGES.DATES.AGE_MINUTES(2));
  await expect(boardCard(page, 1044)).toContainText(MESSAGES.DATES.AGE_NOW);
  await expect(boardCard(page, 1042)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);

  await tab(page, BOARD_TAB_LABELS.PREPARING).click();

  await expect(boardCard(page, 1042)).toContainText("1× Smash duplo, 2× Limonada da casa");
  await expect(boardCard(page, 1042)).toContainText(formatMoney(58.9));
  await expect(boardCard(page, 1043)).toHaveCount(0);
});

test("lays the board out in three columns with their counts from 1024px", async ({
  page,
}): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await page.goto(SCREEN_URLS.ORDERS);

  await expect(column(page, BOARD_COLUMN_LABELS.RECEIVED)).toContainText("Bruna S.");
  await expect(column(page, BOARD_COLUMN_LABELS.RECEIVED).getByRole("heading")).toHaveText(
    `${BOARD_COLUMN_LABELS.RECEIVED}2`,
  );
  await expect(column(page, BOARD_COLUMN_LABELS.PREPARING)).toContainText("Ana P.");
  await expect(column(page, BOARD_COLUMN_LABELS.OUT_FOR_DELIVERY)).toContainText("Paulo T.");
  await expect(boardCard(page, 1042)).toContainText(MESSAGES.DATES.AGE_MINUTES(29));
  await expectNoHorizontalOverflow(page);
});

test("says so when a column has no orders", async ({ page, api }): Promise<void> => {
  await stubOrders(api, staffPage([staffSummary(1043)]));

  await page.goto(SCREEN_URLS.ORDERS);

  await expect(boardCard(page, 1043)).toBeVisible();
  if (showsListCards(page)) {
    await tab(page, BOARD_TAB_LABELS.OUT_FOR_DELIVERY).click();
  }
  await expect(page.getByText(EMPTY_COLUMN_MESSAGES.OUT_FOR_DELIVERY)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("opens an order from its card", async ({ page, api }): Promise<void> => {
  const order: StaffOrder = staffOrder(1043);
  await stubOrder(api, order);
  await page.goto(SCREEN_URLS.ORDERS);

  await boardCard(page, 1043)
    .getByRole("link", { name: MESSAGES.ORDERS.NUMBER(1043) })
    .click();

  await expect(page).toHaveURL(pathIs(orderUrl(order.id)));
  await expect(
    page.getByRole("heading", { name: ORDER_DETAIL_MESSAGES.TITLE(1043, order.customer.name) }),
  ).toBeVisible();
});

test("marks the active view and leads to the history", async ({ page }): Promise<void> => {
  await page.goto(SCREEN_URLS.ORDERS);
  const views: Locator = page.getByRole("navigation", { name: ORDER_LIST_MESSAGES.VIEWS });
  await expect(views.getByRole("link", { name: ORDER_LIST_MESSAGES.ACTIVE })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await views.getByRole("link", { name: ORDER_LIST_MESSAGES.HISTORY }).click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ORDER_HISTORY));
  await expect(views.getByRole("link", { name: ORDER_LIST_MESSAGES.HISTORY })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
