import type { Locator, Page } from "@playwright/test";
import type { StaffCancellationRequest, StaffOrder } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { CANCELLATION_REASON_LABELS, CANCELLED_BY_LABELS } from "../../../src/constants/orders";
import { ADVANCE_LABELS } from "../../../src/pages/orders/order-list/constants/messages";
import {
  DECISION_COPY,
  ORDER_DETAIL_MESSAGES,
  REQUEST_DECIDED_LABELS,
  REQUEST_DECIDED_TITLES,
} from "../../../src/pages/orders/order-list/detail/constants/messages";
import { formatClock } from "../../../src/utils/format-order-date";
import { sentBodies } from "../../support/catalog";
import { HTTP_METHODS, HTTP_UNPROCESSABLE } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import {
  installClock,
  minutesBefore,
  ORDER_WRITE_PATHS,
  orderPath,
  orderUrl,
  staffActionsFor,
  staffOrder,
  stubOrder,
} from "../../support/orders";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const HTTP_CONFLICT: number = 409;

const CUSTOMER_NAME: string = "Ana P.";

const REQUESTED_AT: string = minutesBefore(4);

const DECIDED_AT: string = minutesBefore(1);

const DECISION_NOTE: string = "Já está quase pronto";

const PENDING: StaffCancellationRequest = {
  status: "PENDING",
  reason: "TAKING_TOO_LONG",
  note: "Já faz meia hora",
  requestedAt: REQUESTED_AT,
};

const WAITING: StaffOrder = staffOrder(1042, {
  status: "PREPARING",
  placedAt: minutesBefore(30),
  customer: {
    id: "0199f2a0-0000-7000-8000-000000000001",
    name: CUSTOMER_NAME,
    email: "ana@foody.dev",
  },
  ...staffActionsFor("CANCELLED"),
  cancellationRequest: PENDING,
});

const APPROVED: StaffOrder = {
  ...WAITING,
  status: "CANCELLED",
  live: false,
  cancellation: { cancelledBy: "CUSTOMER", reason: "TAKING_TOO_LONG", note: "Já faz meia hora" },
  cancellationRequest: {
    ...PENDING,
    status: "APPROVED",
    decidedAt: DECIDED_AT,
    decidedByName: "Carlos M.",
    decisionNote: DECISION_NOTE,
  },
  history: [
    ...WAITING.history,
    {
      fromStatus: "PREPARING",
      toStatus: "CANCELLED",
      actorSide: "RESTAURANT",
      actorName: "Carlos M.",
      occurredAt: DECIDED_AT,
      reason: "TAKING_TOO_LONG",
    },
  ],
};

const DECLINED: StaffOrder = {
  ...WAITING,
  ...staffActionsFor("PREPARING"),
  cancellationRequest: {
    ...PENDING,
    status: "DECLINED",
    decidedAt: DECIDED_AT,
    decidedByName: "Carlos M.",
    decisionNote: null,
  },
};

function requestPanel(page: Page): Locator {
  return page.getByRole("region", { name: ORDER_DETAIL_MESSAGES.CUSTOMER_REQUESTED });
}

function decidedBlock(page: Page): Locator {
  return page.getByRole("region", { name: ORDER_DETAIL_MESSAGES.REQUEST });
}

function decisionDialog(page: Page, title: string): Locator {
  return page.getByRole("dialog", { name: title });
}

function readsOf(api: ApiStubs): number {
  return api.requests(HTTP_METHODS.GET, orderPath(WAITING.id)).length;
}

async function openWaitingOrder(page: Page, api: ApiStubs): Promise<void> {
  await stubOrder(api, WAITING);
  await page.goto(orderUrl(WAITING.id));
  await expect(requestPanel(page)).toBeVisible();
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, STAFF_ME);
});

test("shows what the customer asked, why, when and who sent it", async ({
  page,
  api,
}): Promise<void> => {
  await openWaitingOrder(page, api);

  await expect(requestPanel(page)).toContainText(
    MESSAGES.ORDERS.REASON(CANCELLATION_REASON_LABELS.TAKING_TOO_LONG),
  );
  await expect(requestPanel(page)).toContainText("Já faz meia hora");
  await expect(requestPanel(page)).toContainText(
    ORDER_DETAIL_MESSAGES.REQUESTED_BY(formatClock(REQUESTED_AT), CUSTOMER_NAME),
  );
  await expect(
    page.getByRole("region", { name: ORDER_DETAIL_MESSAGES.HISTORY }).getByRole("listitem").first(),
  ).toContainText(ORDER_DETAIL_MESSAGES.REQUEST_CREATED);
  await expectNoHorizontalOverflow(page);
});

test("approves the request with a note for the customer and keeps the decision visible", async ({
  page,
  api,
}): Promise<void> => {
  await openWaitingOrder(page, api);
  await api.respond(HTTP_METHODS.POST, ORDER_WRITE_PATHS.APPROVE(WAITING.id), APPROVED);
  await requestPanel(page).getByRole("button", { name: DECISION_COPY.approve.action }).click();
  const dialog: Locator = decisionDialog(page, DECISION_COPY.approve.title(1042));
  await dialog.getByLabel(ORDER_DETAIL_MESSAGES.DECISION_NOTE).fill(DECISION_NOTE);
  await expectNoHorizontalOverflow(page);

  await dialog.getByRole("button", { name: DECISION_COPY.approve.action }).click();

  await expect(page.getByText(DECISION_COPY.approve.done(1042))).toBeVisible();
  await expect(decidedBlock(page)).toContainText(
    `${REQUEST_DECIDED_LABELS.APPROVED}${ORDER_DETAIL_MESSAGES.LINE_SEPARATOR}${formatClock(DECIDED_AT)}${ORDER_DETAIL_MESSAGES.LINE_SEPARATOR}Carlos M.`,
  );
  await expect(decidedBlock(page)).toContainText(DECISION_NOTE);
  await expect(page.getByText(CANCELLED_BY_LABELS.CUSTOMER)).toBeVisible();
  await expect(page.getByRole("region", { name: ORDER_DETAIL_MESSAGES.HISTORY })).toContainText(
    REQUEST_DECIDED_TITLES.APPROVED,
  );
  expect(sentBodies(api, HTTP_METHODS.POST, ORDER_WRITE_PATHS.APPROVE(WAITING.id))).toEqual([
    { note: DECISION_NOTE },
  ]);
});

test("declines the request without a note and lets the order move on again", async ({
  page,
  api,
}): Promise<void> => {
  await openWaitingOrder(page, api);
  await api.respond(HTTP_METHODS.POST, ORDER_WRITE_PATHS.DECLINE(WAITING.id), DECLINED);
  await requestPanel(page).getByRole("button", { name: DECISION_COPY.decline.action }).click();

  await decisionDialog(page, DECISION_COPY.decline.title(1042))
    .getByRole("button", { name: DECISION_COPY.decline.action })
    .click();

  await expect(page.getByText(DECISION_COPY.decline.done(1042))).toBeVisible();
  await expect(decidedBlock(page)).toContainText(REQUEST_DECIDED_LABELS.DECLINED);
  await expect(page.getByRole("button", { name: ADVANCE_LABELS.OUT_FOR_DELIVERY })).toBeVisible();
  expect(sentBodies(api, HTTP_METHODS.POST, ORDER_WRITE_PATHS.DECLINE(WAITING.id))).toEqual([{}]);
  await expectNoHorizontalOverflow(page);
});

test("keeps the request open when the decision dialog is dismissed", async ({
  page,
  api,
}): Promise<void> => {
  await openWaitingOrder(page, api);
  await requestPanel(page).getByRole("button", { name: DECISION_COPY.approve.action }).click();

  await decisionDialog(page, DECISION_COPY.approve.title(1042))
    .getByRole("button", { name: MESSAGES.CLOSE })
    .click();

  await expect(decisionDialog(page, DECISION_COPY.approve.title(1042))).toHaveCount(0);
  expect(api.requests(HTTP_METHODS.POST, ORDER_WRITE_PATHS.APPROVE(WAITING.id))).toEqual([]);
  await expect(requestPanel(page)).toBeVisible();
});

test("shows the API's detail and reads the order again when nothing is left to decide", async ({
  page,
  api,
}): Promise<void> => {
  const detail: string = "Não há solicitação de cancelamento pendente para este pedido";
  await openWaitingOrder(page, api);
  await api.respond(
    HTTP_METHODS.POST,
    ORDER_WRITE_PATHS.APPROVE(WAITING.id),
    problem(HTTP_UNPROCESSABLE, "NO_PENDING_CANCELLATION_REQUEST", detail),
    HTTP_UNPROCESSABLE,
  );
  await stubOrder(api, DECLINED);
  await requestPanel(page).getByRole("button", { name: DECISION_COPY.approve.action }).click();

  await decisionDialog(page, DECISION_COPY.approve.title(1042))
    .getByRole("button", { name: DECISION_COPY.approve.action })
    .click();

  await expect(page.getByText(detail)).toBeVisible();
  await expect(decisionDialog(page, DECISION_COPY.approve.title(1042))).toHaveCount(0);
  await expect(decidedBlock(page)).toContainText(REQUEST_DECIDED_LABELS.DECLINED);
  expect(readsOf(api)).toBe(2);
  await expectNoHorizontalOverflow(page);
});

test("shows the API's detail and reads the order again when someone else changed it", async ({
  page,
  api,
}): Promise<void> => {
  const detail: string = "O registro foi alterado por outra operação. Recarregue e tente novamente";
  await openWaitingOrder(page, api);
  await api.respond(
    HTTP_METHODS.POST,
    ORDER_WRITE_PATHS.DECLINE(WAITING.id),
    problem(HTTP_CONFLICT, "CONCURRENT_UPDATE", detail),
    HTTP_CONFLICT,
  );
  await stubOrder(api, APPROVED);
  await requestPanel(page).getByRole("button", { name: DECISION_COPY.decline.action }).click();

  await decisionDialog(page, DECISION_COPY.decline.title(1042))
    .getByRole("button", { name: DECISION_COPY.decline.action })
    .click();

  await expect(page.getByText(detail)).toBeVisible();
  await expect(decidedBlock(page)).toContainText(REQUEST_DECIDED_LABELS.APPROVED);
  await expect(requestPanel(page)).toHaveCount(0);
  expect(readsOf(api)).toBe(2);
});
