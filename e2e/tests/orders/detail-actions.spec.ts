import type { Locator, Page } from "@playwright/test";
import type { StaffOrder } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { CANCELLED_BY_LABELS, ORDER_STATUS_LABELS } from "../../../src/constants/orders";
import {
  ADVANCE_LABELS,
  ADVANCED_MESSAGES,
  ORDER_ACTION_MESSAGES,
} from "../../../src/pages/orders/order-list/constants/messages";
import { ORDER_DETAIL_MESSAGES } from "../../../src/pages/orders/order-list/detail/constants/messages";
import { sentBodies } from "../../support/catalog";
import { HTTP_BAD_REQUEST, HTTP_METHODS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { STAFF_ME, staffMeWithOrderActions } from "../../support/me";
import {
  chooseReason,
  expectReasons,
  installClock,
  minutesBefore,
  noteField,
  ORDER_WRITE_PATHS,
  orderPath,
  orderUrl,
  STAFF_REASONS,
  staffActionsFor,
  staffOrder,
  stubOrder,
} from "../../support/orders";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const NOTE: string = "Acabou o gás";

const PREPARING: StaffOrder = staffOrder(1042, {
  status: "PREPARING",
  placedAt: minutesBefore(28),
});

const RECEIVED: StaffOrder = staffOrder(1043, { placedAt: minutesBefore(3) });

const WAITING: StaffOrder = {
  ...PREPARING,
  ...staffActionsFor("CANCELLED"),
  cancellationRequest: {
    status: "PENDING",
    reason: "TAKING_TOO_LONG",
    requestedAt: minutesBefore(1),
  },
};

function nextStep(page: Page): Locator {
  return page.getByRole("region", { name: ORDER_DETAIL_MESSAGES.NEXT_STEP });
}

function cancelDialog(page: Page, number: number): Locator {
  return page.getByRole("dialog", { name: ORDER_ACTION_MESSAGES.CANCEL_TITLE(number) });
}

function readsOf(api: ApiStubs, order: StaffOrder): number {
  return api.requests(HTTP_METHODS.GET, orderPath(order.id)).length;
}

async function openCancelDialog(page: Page): Promise<Locator> {
  await nextStep(page).getByRole("button", { name: ORDER_ACTION_MESSAGES.CANCEL_ORDER }).click();
  return cancelDialog(page, RECEIVED.number);
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, STAFF_ME);
});

test("moves the order to its next step and shows the step after it, without reading it again", async ({
  page,
  api,
}): Promise<void> => {
  await stubOrder(api, PREPARING);
  await api.respond(
    HTTP_METHODS.PATCH,
    ORDER_WRITE_PATHS.STATUS(PREPARING.id),
    staffOrder(1042, { status: "OUT_FOR_DELIVERY", placedAt: PREPARING.placedAt }),
  );
  await page.goto(orderUrl(PREPARING.id));
  await expectNoHorizontalOverflow(page);

  await nextStep(page).getByRole("button", { name: ADVANCE_LABELS.OUT_FOR_DELIVERY }).click();

  await expect(page.getByText(ADVANCED_MESSAGES.OUT_FOR_DELIVERY(1042))).toBeVisible();
  await expect(
    nextStep(page).getByRole("button", { name: ADVANCE_LABELS.DELIVERED }),
  ).toBeVisible();
  expect(sentBodies(api, HTTP_METHODS.PATCH, ORDER_WRITE_PATHS.STATUS(PREPARING.id))).toEqual([
    { status: "OUT_FOR_DELIVERY" },
  ]);
  expect(readsOf(api, PREPARING)).toBe(1);
});

test("asks to decide a waiting cancellation request before moving the order on", async ({
  page,
  api,
}): Promise<void> => {
  await stubOrder(api, WAITING);

  await page.goto(orderUrl(WAITING.id));

  await expect(nextStep(page)).toContainText(ORDER_DETAIL_MESSAGES.DECIDE_FIRST);
  await expect(nextStep(page).getByRole("button")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("offers no step nor cancellation that /me does not grant", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, staffMeWithOrderActions([]));
  await stubOrder(api, PREPARING);

  await page.goto(orderUrl(PREPARING.id));

  await expect(page.getByText(ORDER_STATUS_LABELS.PREPARING, { exact: true })).toBeVisible();
  await expect(nextStep(page)).toHaveCount(0);
});

test("cancels with another reason only once the note tells why", async ({
  page,
  api,
}): Promise<void> => {
  await stubOrder(api, RECEIVED);
  await api.respond(
    HTTP_METHODS.POST,
    ORDER_WRITE_PATHS.CANCEL(RECEIVED.id),
    staffOrder(1043, {
      status: "CANCELLED",
      live: false,
      placedAt: RECEIVED.placedAt,
      cancellation: { cancelledBy: "RESTAURANT", reason: "OTHER", note: NOTE },
    }),
  );
  await page.goto(orderUrl(RECEIVED.id));
  const dialog: Locator = await openCancelDialog(page);
  await expectReasons(dialog, STAFF_REASONS);
  await chooseReason(dialog, "OTHER");
  await dialog.getByRole("button", { name: ORDER_ACTION_MESSAGES.CANCEL_ORDER }).click();
  await expect(dialog.getByText(MESSAGES.VALIDATION.CANCELLATION_NOTE_REQUIRED)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(api.requests(HTTP_METHODS.POST, ORDER_WRITE_PATHS.CANCEL(RECEIVED.id))).toEqual([]);

  await noteField(dialog).fill(NOTE);
  await dialog.getByRole("button", { name: ORDER_ACTION_MESSAGES.CANCEL_ORDER }).click();

  await expect(page.getByText(MESSAGES.ORDERS.CANCELLED(1043))).toBeVisible();
  await expect(page.getByRole("region", { name: MESSAGES.ORDERS.CANCELLED_TITLE })).toContainText(
    CANCELLED_BY_LABELS.RESTAURANT,
  );
  expect(sentBodies(api, HTTP_METHODS.POST, ORDER_WRITE_PATHS.CANCEL(RECEIVED.id))).toEqual([
    { reason: "OTHER", note: NOTE },
  ]);
});

test("puts the API's demand for a note on the note field and keeps the dialog open", async ({
  page,
  api,
}): Promise<void> => {
  await stubOrder(api, RECEIVED);
  await api.respond(
    HTTP_METHODS.POST,
    ORDER_WRITE_PATHS.CANCEL(RECEIVED.id),
    problem(HTTP_BAD_REQUEST, "VALIDATION_FAILED", "Dados inválidos", [
      { field: "note", message: MESSAGES.VALIDATION.CANCELLATION_NOTE_REQUIRED },
    ]),
    HTTP_BAD_REQUEST,
  );
  await page.goto(orderUrl(RECEIVED.id));
  const dialog: Locator = await openCancelDialog(page);
  await chooseReason(dialog, "CUSTOMER_REQUEST");

  await dialog.getByRole("button", { name: ORDER_ACTION_MESSAGES.CANCEL_ORDER }).click();

  await expect(dialog.getByText(MESSAGES.VALIDATION.CANCELLATION_NOTE_REQUIRED)).toBeVisible();
  await expect(noteField(dialog)).toHaveAttribute("aria-invalid", "true");
  expect(sentBodies(api, HTTP_METHODS.POST, ORDER_WRITE_PATHS.CANCEL(RECEIVED.id))).toEqual([
    { reason: "CUSTOMER_REQUEST" },
  ]);
  await expectNoHorizontalOverflow(page);
});
