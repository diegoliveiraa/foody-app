import { API_PATHS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { REDIRECT_TO_PARAM, ROUTE_PATHS } from "../../../src/constants/routes";
import { VALID_PASSWORD } from "../../support/auth";
import { HTTP_CREATED, HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME, ME_LABELS } from "../../support/me";
import { stubMenu } from "../../support/menu";
import { customerPage, stubMyOrders } from "../../support/orders";
import { SIGNED_IN, stubMe, stubSignedOut } from "../../support/session";

const PRIVATE_PATH: string = SCREEN_URLS.MY_ORDERS;

function loginUrlTo(path: string): string {
  return `${ROUTE_PATHS.LOGIN}?${REDIRECT_TO_PARAM}=${encodeURIComponent(path)}`;
}

function heads(pathname: string, redirectTo: string | null): (url: URL) => boolean {
  return (url: URL): boolean =>
    url.pathname === pathname && url.searchParams.get(REDIRECT_TO_PARAM) === redirectTo;
}

test("carries the page the visitor was going to from the login to the sign-up and back", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await page.goto(loginUrlTo(PRIVATE_PATH));

  await page.getByRole("link", { name: MESSAGES.LOGIN.REGISTER_LINK }).click();
  await expect(page).toHaveURL(heads(ROUTE_PATHS.REGISTER, PRIVATE_PATH));
  await page.getByRole("link", { name: MESSAGES.REGISTER.LOGIN_LINK }).click();

  await expect(page).toHaveURL(heads(ROUTE_PATHS.LOGIN, PRIVATE_PATH));
  await expectNoHorizontalOverflow(page);
});

test("brings a visitor who signs up instead of signing in to the page they were going to", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(HTTP_METHODS.POST, API_PATHS.REGISTER, SIGNED_IN, HTTP_CREATED);
  await stubMe(api, CUSTOMER_ME);
  await stubMyOrders(api, customerPage([]));
  await page.goto(loginUrlTo(PRIVATE_PATH));
  await page.getByRole("link", { name: MESSAGES.LOGIN.REGISTER_LINK }).click();
  await expect(page).toHaveURL(heads(ROUTE_PATHS.REGISTER, PRIVATE_PATH));

  await page.getByLabel(MESSAGES.FIELDS.NAME).fill(CUSTOMER_ME.user.name);
  await page.getByLabel(MESSAGES.FIELDS.EMAIL).fill(CUSTOMER_ME.user.email);
  await page.getByLabel(MESSAGES.FIELDS.PASSWORD).fill(VALID_PASSWORD);
  await page.getByRole("button", { name: MESSAGES.REGISTER.SUBMIT }).click();

  await expect(page).toHaveURL(pathIs(PRIVATE_PATH));
  await expect(page.getByRole("heading", { name: ME_LABELS.MY_ORDERS, level: 1 })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("signs up into the first screen when the page to go back to is outside the app", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(HTTP_METHODS.POST, API_PATHS.REGISTER, SIGNED_IN, HTTP_CREATED);
  await stubMe(api, CUSTOMER_ME);
  await stubMenu(api);
  await page.goto(
    `${ROUTE_PATHS.REGISTER}?${REDIRECT_TO_PARAM}=${encodeURIComponent("https://evil.example")}`,
  );
  await expect(page.getByRole("link", { name: MESSAGES.REGISTER.LOGIN_LINK })).toHaveAttribute(
    "href",
    ROUTE_PATHS.LOGIN,
  );

  await page.getByLabel(MESSAGES.FIELDS.NAME).fill(CUSTOMER_ME.user.name);
  await page.getByLabel(MESSAGES.FIELDS.EMAIL).fill(CUSTOMER_ME.user.email);
  await page.getByLabel(MESSAGES.FIELDS.PASSWORD).fill(VALID_PASSWORD);
  await page.getByRole("button", { name: MESSAGES.REGISTER.SUBMIT }).click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
  await expect(page.getByRole("heading", { name: ME_LABELS.MENU, level: 1 })).toBeVisible();
});
