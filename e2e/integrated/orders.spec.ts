import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type Locator,
  type Page,
} from "@playwright/test";
import type { RegisterRequest } from "../../src/@types/auth";
import { API_PATHS } from "../../src/constants/api";
import { MESSAGES } from "../../src/constants/messages";
import { CANCELLED_BY_LABELS, ORDER_STATUS_LABELS } from "../../src/constants/orders";
import { ROUTE_PATHS } from "../../src/constants/routes";
import { ORDER_DETAIL_MESSAGES } from "../../src/pages/orders/order-list/detail/constants/messages";
import { CHECKOUT_MESSAGES } from "../../src/pages/store/menu/checkout/constants/messages";
import { MENU_MESSAGES } from "../../src/pages/store/menu/list/constants/messages";
import {
  SHEET_COPY,
  TRACKING_MESSAGES,
} from "../../src/pages/store/my-orders/detail/constants/messages";
import { signIn, VALID_PASSWORD } from "../support/auth";
import { fillDeliveryAddress, placeOrderButton } from "../support/checkout";
import { HTTP_CREATED, INTEGRATED_API_URL, SCREEN_URLS } from "../support/constants";
import { pathIs } from "../support/layout";
import { ME_LABELS } from "../support/me";
import { continueButton, openBag } from "../support/menu";
import { boardCard, chooseReason } from "../support/orders";
import { readSeedAccounts, type SeedAccounts } from "../support/seed-accounts";

const ACCOUNTS: SeedAccounts = readSeedAccounts();

const RUN_ID: string = String(Date.now());

const NEW_CUSTOMER: RegisterRequest = {
  name: `Cliente Pedido ${RUN_ID}`,
  email: `pedido.${RUN_ID}@e2e.foody.dev`,
  password: VALID_PASSWORD,
};

const ORDER_NUMBER_PATTERN: RegExp = /#(\d+)/;

const ADD_BUTTON_PATTERN: RegExp = new RegExp(`^${MENU_MESSAGES.ADD("")}`);

let placedNumber: number = 0;

let placedPath: string = "";

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ playwright }): Promise<void> => {
  const api: APIRequestContext = await playwright.request.newContext({
    baseURL: INTEGRATED_API_URL,
  });
  const registered: APIResponse = await api.post(API_PATHS.REGISTER, { data: NEW_CUSTOMER });
  expect(registered.status(), "registering the customer this run orders with").toBe(HTTP_CREATED);
  await api.dispose();
});

async function signInAsNewCustomer(page: Page): Promise<void> {
  await page.goto(ROUTE_PATHS.LOGIN);
  await signIn(page, NEW_CUSTOMER.email, NEW_CUSTOMER.password);
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
}

async function signInAsStaff(page: Page): Promise<void> {
  await page.goto(ROUTE_PATHS.LOGIN);
  await signIn(page, ACCOUNTS.staffEmail, ACCOUNTS.password);
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.DASHBOARD));
}

async function numberIn(heading: Locator): Promise<number> {
  const text: string = (await heading.textContent()) ?? "";
  return Number(ORDER_NUMBER_PATTERN.exec(text)?.[1]);
}

test("a new customer orders a product from the menu and follows it as received", async ({
  page,
}): Promise<void> => {
  await signInAsNewCustomer(page);
  await page.getByRole("button", { name: ADD_BUTTON_PATTERN }).first().click();
  await openBag(page);
  await continueButton(page).click();
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.CHECKOUT));
  await expect(placeOrderButton(page)).toBeEnabled();
  await fillDeliveryAddress(page);

  await placeOrderButton(page).click();

  await expect(page).toHaveURL((url: URL): boolean =>
    url.pathname.startsWith(`${SCREEN_URLS.MY_ORDERS}/`),
  );
  const heading: Locator = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveText(ORDER_NUMBER_PATTERN);
  placedNumber = await numberIn(heading);
  placedPath = new URL(page.url()).pathname;
  await expect(page.getByText(CHECKOUT_MESSAGES.PLACED(placedNumber))).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: TRACKING_MESSAGES.STATUS })
      .getByText(ORDER_STATUS_LABELS.RECEIVED, { exact: true })
      .first(),
  ).toBeVisible();
});

test("staff finds the new order on the board and opens it", async ({ page }): Promise<void> => {
  await signInAsStaff(page);
  await page
    .getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN })
    .getByRole("link", { name: ME_LABELS.ORDER_LIST })
    .click();
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ORDERS));

  await boardCard(page, placedNumber)
    .getByRole("link", { name: MESSAGES.ORDERS.NUMBER(placedNumber) })
    .click();

  await expect(
    page.getByRole("heading", {
      name: ORDER_DETAIL_MESSAGES.TITLE(placedNumber, NEW_CUSTOMER.name),
    }),
  ).toBeVisible();
  await expect(page.getByText(NEW_CUSTOMER.email)).toBeVisible();
});

test("the customer cancels the received order from the tracking and sees it cancelled", async ({
  page,
}): Promise<void> => {
  await signInAsNewCustomer(page);
  await page.goto(placedPath);
  await page
    .getByRole("region", { name: TRACKING_MESSAGES.CANCELLATION })
    .getByRole("button", { name: SHEET_COPY.cancel.open })
    .click();
  const sheet: Locator = page.getByRole("dialog", { name: SHEET_COPY.cancel.title });
  await chooseReason(sheet, "CHANGED_MIND");

  await sheet.getByRole("button", { name: SHEET_COPY.cancel.submit }).click();

  await expect(page.getByText(MESSAGES.ORDERS.CANCELLED(placedNumber))).toBeVisible();
  await expect(page.getByText(CANCELLED_BY_LABELS.CUSTOMER)).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: TRACKING_MESSAGES.STATUS })
      .getByText(ORDER_STATUS_LABELS.CANCELLED, { exact: true }),
  ).toBeVisible();
});
