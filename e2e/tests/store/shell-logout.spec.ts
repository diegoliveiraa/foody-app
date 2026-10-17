import type { Locator, Page } from "@playwright/test";
import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, isMobileViewport, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import { stubMenu } from "../../support/menu";
import { stubLogout, stubSession } from "../../support/session";

function accountPanel(page: Page): Locator {
  return page.getByRole(isMobileViewport(page) ? "dialog" : "menu");
}

test("shows the customer's name and e-mail in the account panel", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);
  await stubMenu(api);
  await page.goto(SCREEN_URLS.MENU);

  await page.getByRole("button", { name: MESSAGES.NAVIGATION.ACCOUNT }).click();

  await expect(accountPanel(page).getByText(CUSTOMER_ME.user.name)).toBeVisible();
  await expect(accountPanel(page).getByText(CUSTOMER_ME.user.email)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("signs the customer out to the login page from the account panel", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);
  await stubMenu(api);
  await stubLogout(api);
  await page.goto(SCREEN_URLS.MENU);
  await page.getByRole("button", { name: MESSAGES.NAVIGATION.ACCOUNT }).click();

  await accountPanel(page).getByText(MESSAGES.NAVIGATION.LOGOUT).click();

  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.LOGIN));
  await expect(page.getByRole("heading", { name: MESSAGES.LOGIN.TITLE })).toBeVisible();
});
