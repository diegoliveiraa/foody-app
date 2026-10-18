import type { Locator, Page } from "@playwright/test";
import type { CustomerCancellationRequest, CustomerOrder } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { CANCELLED_BY_LABELS } from "../../../src/constants/orders";
import {
  SHEET_COPY,
  TRACKING_MESSAGES,
} from "../../../src/pages/store/my-orders/detail/constants/messages";
import { sentBodies } from "../../support/catalog";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import {
  chooseReason,
  CUSTOMER_REASONS,
  customerActionsFor,
  customerOrder,
  expectReasons,
  installClock,
  LIVE_POLL,
  minutesBefore,
  myOrderUrl,
  noteField,
  ORDER_WRITE_PATHS,
  stubMyOrder,
} from "../../support/orders";
import { stubSession } from "../../support/session";

const NOTE: string = "Vou sair de casa";

const PREPARING: CustomerOrder = customerOrder(1042, {
  status: "PREPARING",
  placedAt: minutesBefore(28),
});

const PENDING_REQUEST: CustomerCancellationRequest = {
  status: "PENDING",
  reason: "TAKING_TOO_LONG",
  note: NOTE,
  requestedAt: minutesBefore(1),
};

const WAITING: CustomerOrder = {
  ...PREPARING,
  ...customerActionsFor("OUT_FOR_DELIVERY"),
  cancellationRequest: PENDING_REQUEST,
};

const REQUEST_PATH: string = ORDER_WRITE_PATHS.MY_REQUEST(PREPARING.id);

function cancellationBlock(page: Page): Locator {
  return page.getByRole("region", { name: TRACKING_MESSAGES.CANCELLATION });
}

function sheet(page: Page): Locator {
  return page.getByRole("dialog", { name: SHEET_COPY.request.title });
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, CUSTOMER_ME);
});

test("asks the restaurant to cancel an order the kitchen already started", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrder(api, PREPARING);
  await api.respond(HTTP_METHODS.POST, REQUEST_PATH, WAITING);
  await page.goto(myOrderUrl(PREPARING.id));
  await expect(cancellationBlock(page)).toContainText(SHEET_COPY.request.intro);
  await cancellationBlock(page).getByRole("button", { name: SHEET_COPY.request.open }).click();
  const opened: Locator = sheet(page);
  await expect(opened).toContainText(MESSAGES.ORDERS.TITLE(1042));
  await expect(opened).toContainText(TRACKING_MESSAGES.REQUEST_EXPLANATION);
  await expectReasons(opened, CUSTOMER_REASONS);
  await expectNoHorizontalOverflow(page);
  await chooseReason(opened, "TAKING_TOO_LONG");
  await noteField(opened).fill(` ${NOTE} `);

  await opened.getByRole("button", { name: SHEET_COPY.request.submit }).click();

  await expect(page.getByText(SHEET_COPY.request.done(1042))).toBeVisible();
  await expect(sheet(page)).toHaveCount(0);
  await expect(cancellationBlock(page)).toContainText(TRACKING_MESSAGES.REQUEST_PENDING);
  expect(sentBodies(api, HTTP_METHODS.POST, REQUEST_PATH)).toEqual([
    { reason: "TAKING_TOO_LONG", note: NOTE },
  ]);
});

test("keeps following a waiting request and shows the restaurant's refusal with its note", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrder(api, WAITING);
  await page.goto(myOrderUrl(WAITING.id));
  await expect(cancellationBlock(page)).toContainText(TRACKING_MESSAGES.REQUEST_PENDING);
  await expect(page.getByText(TRACKING_MESSAGES.LIVE)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await stubMyOrder(api, {
    ...WAITING,
    cancellationRequest: {
      ...PENDING_REQUEST,
      status: "DECLINED",
      decidedAt: minutesBefore(0),
      decisionNote: "Já está saindo para entrega",
    },
  });

  await page.clock.fastForward(LIVE_POLL);

  await expect(cancellationBlock(page)).toContainText(TRACKING_MESSAGES.REQUEST_DECLINED);
  await expect(cancellationBlock(page)).toContainText("Já está saindo para entrega");
  await expect(cancellationBlock(page).getByRole("button")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("stops telling about the declined request and its note once the order was delivered", async ({
  page,
  api,
}): Promise<void> => {
  const declined: CustomerOrder = {
    ...WAITING,
    status: "OUT_FOR_DELIVERY",
    cancellationRequest: {
      ...PENDING_REQUEST,
      status: "DECLINED",
      decidedAt: minutesBefore(0),
      decisionNote: "Já está saindo para entrega",
    },
  };
  await stubMyOrder(api, declined);
  await page.goto(myOrderUrl(declined.id));
  await expect(cancellationBlock(page)).toContainText(TRACKING_MESSAGES.REQUEST_DECLINED);
  await stubMyOrder(api, {
    ...declined,
    ...customerActionsFor("DELIVERED"),
    status: "DELIVERED",
    live: false,
  });

  await page.clock.fastForward(LIVE_POLL);

  await expect(page.getByText(TRACKING_MESSAGES.LIVE)).toHaveCount(0);
  await expect(cancellationBlock(page)).toHaveCount(0);
  await expect(page.getByText("Já está saindo para entrega")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("shows the order cancelled by the customer once the restaurant approved the request", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrder(api, WAITING);
  await page.goto(myOrderUrl(WAITING.id));
  await expect(cancellationBlock(page)).toContainText(TRACKING_MESSAGES.REQUEST_PENDING);
  await stubMyOrder(api, {
    ...WAITING,
    status: "CANCELLED",
    live: false,
    cancellation: { cancelledBy: "CUSTOMER", reason: "TAKING_TOO_LONG", note: NOTE },
    cancellationRequest: { ...PENDING_REQUEST, status: "APPROVED", decidedAt: minutesBefore(0) },
  });

  await page.clock.fastForward(LIVE_POLL);

  await expect(page.getByText(CANCELLED_BY_LABELS.CUSTOMER)).toBeVisible();
  await expect(cancellationBlock(page)).toHaveCount(0);
});
