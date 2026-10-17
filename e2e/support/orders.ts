import { expect, type Locator, type Page } from "@playwright/test";
import type { CancellationReason } from "../../src/@types/orders";
import type {
  CustomerOrder,
  CustomerOrderPage,
  StaffOrder,
  StaffOrderPage,
} from "../../src/@types/orders";
import { API_PATHS, MY_ORDER_PATHS, ORDER_PATHS } from "../../src/constants/api";
import { MESSAGES } from "../../src/constants/messages";
import { CANCELLATION_REASON_LABELS } from "../../src/constants/orders";
import { HTTP_METHODS, SCREEN_URLS } from "./constants";
import type { ApiStubs, RecordedRequest } from "./fixtures";
import { showsListCards } from "./layout";

export {
  CUSTOMER_REASONS,
  customerActionsFor,
  customerOrder,
  customerPage,
  customerSummary,
  orderId,
  PAULISTA,
  STAFF_REASONS,
  staffActionsFor,
  staffOrder,
  staffPage,
  staffSummary,
} from "../../src/test/orders";

export const MY_ORDERS_PATH: string = API_PATHS.MY_ORDERS;

export const ORDERS_PATH: string = API_PATHS.ORDERS;

export const LIVE_POLL: string = "00:30";

export const CLOCK_START: Date = new Date(2026, 9, 17, 19, 30, 0);

const MS_PER_MINUTE: number = 60_000;

export function minutesBefore(minutes: number, from: Date = CLOCK_START): string {
  return new Date(from.getTime() - minutes * MS_PER_MINUTE).toISOString();
}

export function myOrderPath(id: string): string {
  return `${MY_ORDERS_PATH}/${id}`;
}

export function myOrderUrl(id: string): string {
  return `${SCREEN_URLS.MY_ORDERS}/${id}`;
}

export function orderPath(id: string): string {
  return `${ORDERS_PATH}/${id}`;
}

export function orderUrl(id: string): string {
  return `${SCREEN_URLS.ORDERS}/${id}`;
}

export async function stubMyOrders(api: ApiStubs, page: CustomerOrderPage): Promise<void> {
  await api.respond(HTTP_METHODS.GET, MY_ORDERS_PATH, page);
}

export async function stubMyOrder(api: ApiStubs, order: CustomerOrder): Promise<void> {
  await api.respond(HTTP_METHODS.GET, myOrderPath(order.id), order);
}

export async function stubOrders(api: ApiStubs, page: StaffOrderPage): Promise<void> {
  await api.respond(HTTP_METHODS.GET, ORDERS_PATH, page);
}

export async function stubOrder(api: ApiStubs, order: StaffOrder): Promise<void> {
  await api.respond(HTTP_METHODS.GET, orderPath(order.id), order);
}

export function orderQueries(api: ApiStubs): URLSearchParams[] {
  return api
    .requests(HTTP_METHODS.GET, ORDERS_PATH)
    .map((request: RecordedRequest): URLSearchParams => request.url.searchParams);
}

export function historyQueries(api: ApiStubs): Record<string, string>[] {
  return orderQueries(api).map((query: URLSearchParams): Record<string, string> =>
    Object.fromEntries(query),
  );
}

export function orderEntry(page: Page, number: number): Locator {
  if (showsListCards(page)) {
    return page.getByRole("article", { name: MESSAGES.ORDERS.TITLE(number) });
  }
  return page.getByRole("row").filter({ hasText: MESSAGES.ORDERS.NUMBER(number) });
}

export function boardCard(page: Page, number: number): Locator {
  return page.getByRole("article", { name: MESSAGES.ORDERS.TITLE(number) });
}

export async function installClock(page: Page): Promise<void> {
  await page.clock.install({ time: CLOCK_START });
}

export const ORDER_WRITE_PATHS = {
  STATUS: ORDER_PATHS.STATUS,
  CANCEL: ORDER_PATHS.CANCEL,
  APPROVE: ORDER_PATHS.APPROVE_CANCELLATION,
  DECLINE: ORDER_PATHS.DECLINE_CANCELLATION,
  MY_CANCEL: MY_ORDER_PATHS.CANCEL,
  MY_REQUEST: MY_ORDER_PATHS.REQUEST_CANCELLATION,
} as const;

export async function expectReasons(
  scope: Locator,
  reasons: readonly CancellationReason[],
): Promise<void> {
  const radios: Locator = scope.getByRole("radio");
  await expect(radios).toHaveCount(reasons.length);
  for (const [index, reason] of reasons.entries()) {
    await expect(radios.nth(index)).toHaveAccessibleName(CANCELLATION_REASON_LABELS[reason]);
  }
}

export async function chooseReason(scope: Locator, reason: CancellationReason): Promise<void> {
  await scope.getByRole("radio", { name: CANCELLATION_REASON_LABELS[reason] }).click();
}

export function noteField(scope: Locator): Locator {
  return scope.getByLabel(MESSAGES.CANCELLATION.NOTE);
}
