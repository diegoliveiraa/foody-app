import type { Locator, Page } from "@playwright/test";
import type { CustomerOrder } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { CANCELLED_BY_LABELS, ORDER_STATUS_LABELS } from "../../../src/constants/orders";
import {
  SHEET_COPY,
  TRACKING_MESSAGES,
} from "../../../src/pages/store/my-orders/detail/constants/messages";
import { sentBodies } from "../../support/catalog";
import { HTTP_METHODS, HTTP_UNPROCESSABLE } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { CUSTOMER_ME, customerMeWithOrderActions } from "../../support/me";
import {
  chooseReason,
  CUSTOMER_REASONS,
  customerOrder,
  expectReasons,
  installClock,
  minutesBefore,
  myOrderPath,
  myOrderUrl,
  noteField,
  ORDER_WRITE_PATHS,
  stubMyOrder,
} from "../../support/orders";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const RECEIVED: CustomerOrder = customerOrder(1042, { placedAt: minutesBefore(2) });

const CANCELLED: CustomerOrder = customerOrder(1042, {
  status: "CANCELLED",
  live: false,
  placedAt: RECEIVED.placedAt,
  cancellation: { cancelledBy: "CUSTOMER", reason: "CHANGED_MIND", note: null },
});

const CANCEL_PATH: string = ORDER_WRITE_PATHS.MY_CANCEL(RECEIVED.id);

function cancellationBlock(page: Page): Locator {
  return page.getByRole("region", { name: TRACKING_MESSAGES.CANCELLATION });
}

function sheet(page: Page): Locator {
  return page.getByRole("dialog", { name: SHEET_COPY.cancel.title });
}

async function openSheet(page: Page, api: ApiStubs): Promise<Locator> {
  await stubMyOrder(api, RECEIVED);
  await page.goto(myOrderUrl(RECEIVED.id));
  await cancellationBlock(page).getByRole("button", { name: SHEET_COPY.cancel.open }).click();
  await expect(sheet(page)).toBeVisible();
  return sheet(page);
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, CUSTOMER_ME);
});

test("offers to cancel an order the restaurant has not started yet", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrder(api, RECEIVED);

  await page.goto(myOrderUrl(RECEIVED.id));

  await expect(cancellationBlock(page)).toContainText(SHEET_COPY.cancel.intro);
  await expectNoHorizontalOverflow(page);
});

test("cancels the order with a reason from the sheet and shows it cancelled by the customer", async ({
  page,
  api,
}): Promise<void> => {
  const opened: Locator = await openSheet(page, api);
  await expect(opened).toContainText(MESSAGES.ORDERS.TITLE(1042));
  await expectReasons(opened, CUSTOMER_REASONS);
  await expectNoHorizontalOverflow(page);
  await api.respond(HTTP_METHODS.POST, CANCEL_PATH, CANCELLED);

  await chooseReason(opened, "CHANGED_MIND");
  await opened.getByRole("button", { name: SHEET_COPY.cancel.submit }).click();

  await expect(page.getByText(MESSAGES.ORDERS.CANCELLED(1042))).toBeVisible();
  await expect(page.getByText(CANCELLED_BY_LABELS.CUSTOMER)).toBeVisible();
  await expect(page.getByText(ORDER_STATUS_LABELS.CANCELLED, { exact: true })).toBeVisible();
  await expect(cancellationBlock(page)).toHaveCount(0);
  expect(sentBodies(api, HTTP_METHODS.POST, CANCEL_PATH)).toEqual([{ reason: "CHANGED_MIND" }]);
});

test("keeps the order on 'Manter pedido'", async ({ page, api }): Promise<void> => {
  const opened: Locator = await openSheet(page, api);

  await opened.getByRole("button", { name: TRACKING_MESSAGES.KEEP_ORDER }).click();

  await expect(sheet(page)).toHaveCount(0);
  await expect(cancellationBlock(page)).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, CANCEL_PATH)).toEqual([]);
});

test("asks for a reason, and for the note when the reason is another one", async ({
  page,
  api,
}): Promise<void> => {
  const opened: Locator = await openSheet(page, api);
  await opened.getByRole("button", { name: SHEET_COPY.cancel.submit }).click();
  await expect(opened.getByText(MESSAGES.VALIDATION.CANCELLATION_REASON_REQUIRED)).toBeVisible();

  await chooseReason(opened, "OTHER");
  await opened.getByRole("button", { name: SHEET_COPY.cancel.submit }).click();

  await expect(opened.getByText(MESSAGES.VALIDATION.CANCELLATION_NOTE_REQUIRED)).toBeVisible();
  await expect(noteField(opened)).toHaveAttribute("aria-required", "true");
  expect(api.requests(HTTP_METHODS.POST, CANCEL_PATH)).toEqual([]);
  await expectNoHorizontalOverflow(page);
});

test("closes the sheet with the API's detail and shows the order as it is now when the kitchen started meanwhile", async ({
  page,
  api,
}): Promise<void> => {
  const detail: string = "Este pedido não pode ser cancelado agora";
  const opened: Locator = await openSheet(page, api);
  await api.respond(
    HTTP_METHODS.POST,
    CANCEL_PATH,
    problem(HTTP_UNPROCESSABLE, "CANCELLATION_NOT_ALLOWED", detail),
    HTTP_UNPROCESSABLE,
  );
  await stubMyOrder(api, customerOrder(1042, { status: "PREPARING", placedAt: RECEIVED.placedAt }));
  await chooseReason(opened, "ORDERED_BY_MISTAKE");

  await opened.getByRole("button", { name: SHEET_COPY.cancel.submit }).click();

  await expect(page.getByText(detail)).toBeVisible();
  await expect(sheet(page)).toHaveCount(0);
  await expect(cancellationBlock(page)).toContainText(SHEET_COPY.request.intro);
  expect(api.requests(HTTP_METHODS.GET, myOrderPath(RECEIVED.id))).toHaveLength(2);
});

test("offers no cancellation that /me does not grant", async ({ page, api }): Promise<void> => {
  await stubSession(api, customerMeWithOrderActions([]));
  await stubMyOrder(api, RECEIVED);

  await page.goto(myOrderUrl(RECEIVED.id));

  await expect(page.getByText(ORDER_STATUS_LABELS.RECEIVED, { exact: true }).first()).toBeVisible();
  await expect(cancellationBlock(page)).toHaveCount(0);
});
