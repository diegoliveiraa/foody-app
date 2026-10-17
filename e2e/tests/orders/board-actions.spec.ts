import type { Locator, Page } from "@playwright/test";
import type { StaffOrder, StaffOrderSummary } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import {
  BOARD_TAB_LABELS,
  CANCELLATION_REASON_LABELS,
  type BoardStatus,
} from "../../../src/constants/orders";
import { BOARD_MESSAGES } from "../../../src/pages/orders/order-list/board/constants/messages";
import {
  ADVANCE_LABELS,
  ADVANCED_MESSAGES,
  ORDER_ACTION_MESSAGES,
  ORDER_LIST_MESSAGES,
} from "../../../src/pages/orders/order-list/constants/messages";
import { ORDER_DETAIL_MESSAGES } from "../../../src/pages/orders/order-list/detail/constants/messages";
import { sentBodies } from "../../support/catalog";
import { HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs, showsListCards } from "../../support/layout";
import { STAFF_ME, staffMeWithOrderActions } from "../../support/me";
import {
  boardCard,
  chooseReason,
  expectReasons,
  installClock,
  minutesBefore,
  ORDER_WRITE_PATHS,
  orderQueries,
  orderUrl,
  STAFF_REASONS,
  staffOrder,
  staffPage,
  staffSummary,
  stubOrder,
  stubOrders,
} from "../../support/orders";
import { stubSession } from "../../support/session";

const UPDATED_PATTERN: RegExp = /Atualizado há/;

const RECEIVED: StaffOrderSummary = staffSummary(1043, {
  customerName: "Bruna S.",
  placedAt: minutesBefore(2),
});

const NO_ACTIONS: Pick<
  StaffOrderSummary,
  "allowedTransitions" | "canCancel" | "cancellationReasons"
> = { allowedTransitions: [], canCancel: false, cancellationReasons: [] };

function waitingFor(number: number, placedAt: string): StaffOrderSummary {
  return staffSummary(number, {
    status: "PREPARING",
    placedAt,
    hasPendingCancellationRequest: true,
    ...NO_ACTIONS,
  });
}

const OLDER_WAITING: StaffOrderSummary = waitingFor(1041, minutesBefore(31));

const NEWER_WAITING: StaffOrderSummary = waitingFor(1042, minutesBefore(29));

async function showColumn(page: Page, status: BoardStatus): Promise<void> {
  if (!showsListCards(page)) {
    return;
  }
  await page.getByRole("tab", { name: new RegExp(BOARD_TAB_LABELS[status]) }).click();
}

function cancelDialog(page: Page, number: number): Locator {
  return page.getByRole("dialog", { name: ORDER_ACTION_MESSAGES.CANCEL_TITLE(number) });
}

async function openBoard(page: Page, api: ApiStubs, orders: StaffOrderSummary[]): Promise<void> {
  await stubOrders(api, staffPage(orders));
  await page.goto(SCREEN_URLS.ORDERS);
  await expect(page.getByText(UPDATED_PATTERN)).toBeVisible();
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, STAFF_ME);
});

test("starts preparing a received order from its card and asks for the board again", async ({
  page,
  api,
}): Promise<void> => {
  await openBoard(page, api, [RECEIVED]);
  await api.respond(
    HTTP_METHODS.PATCH,
    ORDER_WRITE_PATHS.STATUS(RECEIVED.id),
    staffOrder(1043, { status: "PREPARING" }),
  );
  await stubOrders(api, staffPage([{ ...RECEIVED, status: "PREPARING" }]));
  await expectNoHorizontalOverflow(page);

  await boardCard(page, 1043).getByRole("button", { name: ADVANCE_LABELS.PREPARING }).click();

  await expect(page.getByText(ADVANCED_MESSAGES.PREPARING(1043))).toBeVisible();
  await expect
    .poll((): unknown[] =>
      sentBodies(api, HTTP_METHODS.PATCH, ORDER_WRITE_PATHS.STATUS(RECEIVED.id)),
    )
    .toEqual([{ status: "PREPARING" }]);
  await expect.poll((): number => orderQueries(api).length).toBe(2);
});

test("cancels an order from its card with one of the reasons the API offers", async ({
  page,
  api,
}): Promise<void> => {
  await openBoard(page, api, [RECEIVED]);
  await api.respond(
    HTTP_METHODS.POST,
    ORDER_WRITE_PATHS.CANCEL(RECEIVED.id),
    staffOrder(1043, { status: "CANCELLED", live: false }),
  );
  await boardCard(page, 1043).getByRole("button", { name: ORDER_ACTION_MESSAGES.CANCEL }).click();
  const dialog: Locator = cancelDialog(page, 1043);
  await expectReasons(dialog, STAFF_REASONS);
  await expectNoHorizontalOverflow(page);
  await stubOrders(api, staffPage([]));

  await chooseReason(dialog, "STORE_CLOSED");
  await dialog.getByRole("button", { name: ORDER_ACTION_MESSAGES.CANCEL_ORDER }).click();

  await expect(page.getByText(MESSAGES.ORDERS.CANCELLED(1043))).toBeVisible();
  await expect(dialog).toHaveCount(0);
  expect(sentBodies(api, HTTP_METHODS.POST, ORDER_WRITE_PATHS.CANCEL(RECEIVED.id))).toEqual([
    { reason: "STORE_CLOSED" },
  ]);
  await expect(boardCard(page, 1043)).toHaveCount(0);
});

test("leaves cancelling an order out for delivery to its detail page", async ({
  page,
  api,
}): Promise<void> => {
  const leaving: StaffOrderSummary = staffSummary(1038, {
    status: "OUT_FOR_DELIVERY",
    allowedTransitions: ["DELIVERED"],
    canCancel: true,
    cancellationReasons: ["DELIVERY_FAILED"],
  });
  await openBoard(page, api, [leaving]);

  await showColumn(page, "OUT_FOR_DELIVERY");

  await expect(
    boardCard(page, 1038).getByRole("button", { name: ADVANCE_LABELS.DELIVERED }),
  ).toBeVisible();
  await expect(
    boardCard(page, 1038).getByRole("button", { name: ORDER_ACTION_MESSAGES.CANCEL }),
  ).toHaveCount(0);
});

test("keeps the order when the cancel dialog is dismissed", async ({
  page,
  api,
}): Promise<void> => {
  await openBoard(page, api, [RECEIVED]);
  await boardCard(page, 1043).getByRole("button", { name: ORDER_ACTION_MESSAGES.CANCEL }).click();

  await cancelDialog(page, 1043).getByRole("button", { name: ORDER_ACTION_MESSAGES.BACK }).click();

  await expect(cancelDialog(page, 1043)).toHaveCount(0);
  expect(api.requests(HTTP_METHODS.POST, ORDER_WRITE_PATHS.CANCEL(RECEIVED.id))).toEqual([]);
  await expect(boardCard(page, 1043)).toBeVisible();
});

test("highlights an order whose customer asked to cancel, with a way to the request instead of actions", async ({
  page,
  api,
}): Promise<void> => {
  await openBoard(page, api, [RECEIVED, NEWER_WAITING]);
  await showColumn(page, "PREPARING");

  const card: Locator = boardCard(page, 1042);
  await expect(card.getByText(ORDER_LIST_MESSAGES.CUSTOMER_REQUESTED)).toBeVisible();
  await expect(card.getByRole("link", { name: ORDER_LIST_MESSAGES.VIEW_REQUEST })).toHaveAttribute(
    "href",
    orderUrl(NEWER_WAITING.id),
  );
  await expect(card.getByRole("button")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("announces the waiting requests above the board and leads to the oldest one", async ({
  page,
  api,
}): Promise<void> => {
  const oldest: StaffOrder = staffOrder(1041, {
    status: "PREPARING",
    placedAt: OLDER_WAITING.placedAt,
    ...NO_ACTIONS,
    cancellationRequest: {
      status: "PENDING",
      reason: "TAKING_TOO_LONG",
      requestedAt: minutesBefore(1),
    },
  });
  await stubOrder(api, oldest);
  await openBoard(page, api, [OLDER_WAITING, NEWER_WAITING, RECEIVED]);
  const banner: Locator = page.getByRole("link", { name: BOARD_MESSAGES.PENDING_REQUESTS(2) });
  await expect(banner).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await banner.click();

  await expect(page).toHaveURL(pathIs(orderUrl(oldest.id)));
  await expect(
    page.getByRole("region", { name: ORDER_DETAIL_MESSAGES.CUSTOMER_REQUESTED }),
  ).toContainText(CANCELLATION_REASON_LABELS.TAKING_TOO_LONG);
});

test("says a single request is waiting in the singular", async ({ page, api }): Promise<void> => {
  await openBoard(page, api, [NEWER_WAITING]);

  await expect(page.getByRole("link", { name: BOARD_MESSAGES.PENDING_REQUESTS(1) })).toBeVisible();
});

test("offers no action, link or banner that /me does not grant", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, staffMeWithOrderActions([]));
  await openBoard(page, api, [RECEIVED, NEWER_WAITING]);
  await expect(boardCard(page, 1043)).toBeVisible();

  await expect(boardCard(page, 1043).getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("link", { name: BOARD_MESSAGES.PENDING_REQUESTS(1) })).toHaveCount(0);
  await showColumn(page, "PREPARING");
  await expect(
    boardCard(page, 1042).getByText(ORDER_LIST_MESSAGES.CUSTOMER_REQUESTED),
  ).toBeVisible();
  await expect(
    boardCard(page, 1042).getByRole("link", { name: ORDER_LIST_MESSAGES.VIEW_REQUEST }),
  ).toHaveCount(0);
});

test("offers no action the API does not allow for the order", async ({
  page,
  api,
}): Promise<void> => {
  await openBoard(page, api, [{ ...RECEIVED, ...NO_ACTIONS }]);

  await expect(boardCard(page, 1043)).toBeVisible();
  await expect(boardCard(page, 1043).getByRole("button")).toHaveCount(0);
});
