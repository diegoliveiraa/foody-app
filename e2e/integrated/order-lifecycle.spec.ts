import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type Locator,
  type Page,
} from "@playwright/test";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../../src/@types/auth";
import type { MenuCategory, MenuProduct, MenuResponse } from "../../src/@types/menu";
import type { CustomerOrder, PlaceOrderRequest } from "../../src/@types/orders";
import { API_PATHS, BEARER_PREFIX, HTTP_HEADERS } from "../../src/constants/api";
import { MESSAGES } from "../../src/constants/messages";
import {
  CANCELLED_BY_LABELS,
  ORDER_STATUS_LABELS,
  type AdvanceStatus,
} from "../../src/constants/orders";
import { ROUTE_PATHS } from "../../src/constants/routes";
import {
  ADVANCE_LABELS,
  ADVANCED_MESSAGES,
  ORDER_LIST_MESSAGES,
} from "../../src/pages/orders/order-list/constants/messages";
import {
  DECISION_COPY,
  ORDER_DETAIL_MESSAGES,
} from "../../src/pages/orders/order-list/detail/constants/messages";
import type { Decision } from "../../src/pages/orders/order-list/detail/types";
import {
  SHEET_COPY,
  TRACKING_MESSAGES,
} from "../../src/pages/store/my-orders/detail/constants/messages";
import { signIn, VALID_PASSWORD } from "../support/auth";
import { HTTP_CREATED, HTTP_OK, INTEGRATED_API_URL, SCREEN_URLS } from "../support/constants";
import { pathIs } from "../support/layout";
import { ME_LABELS } from "../support/me";
import {
  boardCard,
  chooseReason,
  myOrderUrl,
  noteField,
  orderUrl,
  PAULISTA,
} from "../support/orders";
import { readSeedAccounts, type SeedAccounts } from "../support/seed-accounts";

interface PlacedOrder {
  id: string;
  number: number;
}

const ACCOUNTS: SeedAccounts = readSeedAccounts();

const RUN_ID: string = String(Date.now());

const CUSTOMER: RegisterRequest = {
  name: `Cliente Ciclo ${RUN_ID}`,
  email: `ciclo.${RUN_ID}@e2e.foody.dev`,
  password: VALID_PASSWORD,
};

const REQUEST_NOTE: string = "Pedido feito por engano";

const ORDERS_TO_PLACE: number = 3;

const NO_ORDER: PlacedOrder = { id: "", number: 0 };

let delivered: PlacedOrder = NO_ORDER;

let approved: PlacedOrder = NO_ORDER;

let declined: PlacedOrder = NO_ORDER;

test.describe.configure({ mode: "serial" });

async function accessTokenOf(api: APIRequestContext): Promise<string> {
  const login: LoginRequest = { email: CUSTOMER.email, password: CUSTOMER.password };
  const response: APIResponse = await api.post(API_PATHS.LOGIN, { data: login });
  expect(response.status(), "logging the new customer in to place orders").toBe(HTTP_OK);
  const auth: AuthResponse = (await response.json()) as AuthResponse;
  return auth.accessToken;
}

async function firstProductOf(api: APIRequestContext, token: string): Promise<MenuProduct> {
  const response: APIResponse = await api.get(API_PATHS.MENU, {
    headers: { [HTTP_HEADERS.AUTHORIZATION]: `${BEARER_PREFIX}${token}` },
  });
  const menu: MenuResponse = (await response.json()) as MenuResponse;
  const product: MenuProduct | undefined = menu.categories.flatMap(
    (category: MenuCategory): MenuProduct[] => category.products,
  )[0];
  expect(product, "the seed menu has a product to order").toBeDefined();
  return product as MenuProduct;
}

async function placeOrder(
  api: APIRequestContext,
  token: string,
  product: MenuProduct,
): Promise<PlacedOrder> {
  const order: PlaceOrderRequest = {
    items: [{ productId: product.id, quantity: 1 }],
    deliveryAddress: PAULISTA,
  };
  const response: APIResponse = await api.post(API_PATHS.MY_ORDERS, {
    data: order,
    headers: { [HTTP_HEADERS.AUTHORIZATION]: `${BEARER_PREFIX}${token}` },
  });
  expect(response.status(), "placing an order for this run").toBe(HTTP_CREATED);
  const placed: CustomerOrder = (await response.json()) as CustomerOrder;
  return { id: placed.id, number: placed.number };
}

test.beforeAll(async ({ playwright }): Promise<void> => {
  const api: APIRequestContext = await playwright.request.newContext({
    baseURL: INTEGRATED_API_URL,
  });
  const registered: APIResponse = await api.post(API_PATHS.REGISTER, { data: CUSTOMER });
  expect(registered.status(), "registering the customer this run orders with").toBe(HTTP_CREATED);
  const token: string = await accessTokenOf(api);
  const product: MenuProduct = await firstProductOf(api, token);
  const placed: PlacedOrder[] = [];
  for (let count: number = 0; count < ORDERS_TO_PLACE; count += 1) {
    placed.push(await placeOrder(api, token, product));
  }
  [delivered = NO_ORDER, approved = NO_ORDER, declined = NO_ORDER] = placed;
  await api.dispose();
});

async function signInAsStaff(page: Page): Promise<void> {
  await page.goto(ROUTE_PATHS.LOGIN);
  await signIn(page, ACCOUNTS.staffEmail, ACCOUNTS.password);
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.DASHBOARD));
}

async function signInAsCustomer(page: Page): Promise<void> {
  await page.goto(ROUTE_PATHS.LOGIN);
  await signIn(page, CUSTOMER.email, CUSTOMER.password);
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
}

function nextStep(page: Page): Locator {
  return page.getByRole("region", { name: ORDER_DETAIL_MESSAGES.NEXT_STEP });
}

function requestPanel(page: Page): Locator {
  return page.getByRole("region", { name: ORDER_DETAIL_MESSAGES.CUSTOMER_REQUESTED });
}

function cancellationBlock(page: Page): Locator {
  return page.getByRole("region", { name: TRACKING_MESSAGES.CANCELLATION });
}

function trackedStatus(page: Page, label: string): Locator {
  return page
    .getByRole("region", { name: TRACKING_MESSAGES.STATUS })
    .getByText(label, { exact: true })
    .first();
}

async function openOrderAsStaff(page: Page, order: PlacedOrder): Promise<void> {
  await signInAsStaff(page);
  await page.goto(orderUrl(order.id));
  await expect(
    page.getByRole("heading", { name: ORDER_DETAIL_MESSAGES.TITLE(order.number, CUSTOMER.name) }),
  ).toBeVisible();
}

async function advance(page: Page, order: PlacedOrder, step: AdvanceStatus): Promise<void> {
  await nextStep(page).getByRole("button", { name: ADVANCE_LABELS[step] }).click();
  await expect(page.getByText(ADVANCED_MESSAGES[step](order.number))).toBeVisible();
}

async function openTracking(page: Page, order: PlacedOrder): Promise<void> {
  await signInAsCustomer(page);
  await page.goto(myOrderUrl(order.id));
  await expect(
    page.getByRole("heading", { name: MESSAGES.ORDERS.TITLE(order.number) }),
  ).toBeVisible();
}

async function requestCancellation(page: Page, order: PlacedOrder): Promise<void> {
  await openTracking(page, order);
  await cancellationBlock(page).getByRole("button", { name: SHEET_COPY.request.open }).click();
  const sheet: Locator = page.getByRole("dialog", { name: SHEET_COPY.request.title });
  await chooseReason(sheet, "ORDERED_BY_MISTAKE");
  await noteField(sheet).fill(REQUEST_NOTE);
  await sheet.getByRole("button", { name: SHEET_COPY.request.submit }).click();
  await expect(page.getByText(SHEET_COPY.request.done(order.number))).toBeVisible();
  await expect(cancellationBlock(page)).toContainText(TRACKING_MESSAGES.REQUEST_PENDING);
}

async function decide(page: Page, decision: Decision): Promise<void> {
  await requestPanel(page).getByRole("button", { name: DECISION_COPY[decision].action }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: DECISION_COPY[decision].action })
    .click();
}

test("staff takes a fresh order from received to delivered on its detail", async ({
  page,
}): Promise<void> => {
  await openOrderAsStaff(page, delivered);

  await advance(page, delivered, "PREPARING");
  await advance(page, delivered, "OUT_FOR_DELIVERY");
  await advance(page, delivered, "DELIVERED");

  await expect(nextStep(page)).toHaveCount(0);
});

test("the customer's tracking shows the order delivered", async ({ page }): Promise<void> => {
  await openTracking(page, delivered);

  await expect(trackedStatus(page, ORDER_STATUS_LABELS.DELIVERED)).toBeVisible();
  await expect(page.getByText(TRACKING_MESSAGES.LIVE)).toHaveCount(0);
});

test("staff starts preparing the order the customer will ask to cancel", async ({
  page,
}): Promise<void> => {
  await openOrderAsStaff(page, approved);

  await advance(page, approved, "PREPARING");
});

test("the customer asks to cancel the order in preparation, with a reason", async ({
  page,
}): Promise<void> => {
  await requestCancellation(page, approved);
});

test("the staff board flags the order whose customer asked to cancel", async ({
  page,
}): Promise<void> => {
  await signInAsStaff(page);
  await page
    .getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN })
    .getByRole("link", { name: ME_LABELS.ORDER_LIST })
    .click();
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ORDERS));

  const card: Locator = boardCard(page, approved.number);

  await expect(card.getByText(ORDER_LIST_MESSAGES.CUSTOMER_REQUESTED)).toBeVisible();
  await card.getByRole("link", { name: ORDER_LIST_MESSAGES.VIEW_REQUEST }).click();
  await expect(page).toHaveURL(pathIs(orderUrl(approved.id)));
});

test("staff approves the request on the detail", async ({ page }): Promise<void> => {
  await openOrderAsStaff(page, approved);
  await expect(requestPanel(page)).toContainText(REQUEST_NOTE);

  await decide(page, "approve");

  await expect(page.getByText(DECISION_COPY.approve.done(approved.number))).toBeVisible();
  await expect(page.getByText(CANCELLED_BY_LABELS.CUSTOMER)).toBeVisible();
});

test("the customer sees the order cancelled at their request", async ({ page }): Promise<void> => {
  await openTracking(page, approved);

  await expect(trackedStatus(page, ORDER_STATUS_LABELS.CANCELLED)).toBeVisible();
  await expect(page.getByText(CANCELLED_BY_LABELS.CUSTOMER)).toBeVisible();
});

test("staff starts preparing the order whose cancellation will be declined", async ({
  page,
}): Promise<void> => {
  await openOrderAsStaff(page, declined);

  await advance(page, declined, "PREPARING");
});

test("the customer asks to cancel it too", async ({ page }): Promise<void> => {
  await requestCancellation(page, declined);
});

test("staff declines the request and the order can move on again", async ({
  page,
}): Promise<void> => {
  await openOrderAsStaff(page, declined);
  await expect(nextStep(page)).toContainText(ORDER_DETAIL_MESSAGES.DECIDE_FIRST);

  await decide(page, "decline");

  await expect(page.getByText(DECISION_COPY.decline.done(declined.number))).toBeVisible();
  await expect(
    nextStep(page).getByRole("button", { name: ADVANCE_LABELS.OUT_FOR_DELIVERY }),
  ).toBeVisible();
});

test("the customer sees the restaurant declined the cancellation", async ({
  page,
}): Promise<void> => {
  await openTracking(page, declined);

  await expect(cancellationBlock(page)).toContainText(TRACKING_MESSAGES.REQUEST_DECLINED);
  await expect(trackedStatus(page, ORDER_STATUS_LABELS.PREPARING)).toBeVisible();
});

test("staff finishes the declined order so nothing stays active", async ({
  page,
}): Promise<void> => {
  await openOrderAsStaff(page, declined);

  await advance(page, declined, "OUT_FOR_DELIVERY");
  await advance(page, declined, "DELIVERED");

  await expect(nextStep(page)).toHaveCount(0);
});
