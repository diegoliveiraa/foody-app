import type { Locator } from "@playwright/test";
import { API_PATHS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { signIn } from "../../support/auth";
import { openBackofficeNavigation } from "../../support/backoffice";
import { HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME, ME_LABELS, STAFF_ME } from "../../support/me";
import { SIGNED_IN, stubMe, stubSignedOut } from "../../support/session";

test("a customer who signs in lands on the menu, with the store navigation", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(HTTP_METHODS.POST, API_PATHS.LOGIN, SIGNED_IN);
  await stubMe(api, CUSTOMER_ME);
  await page.goto(ROUTE_PATHS.LOGIN);

  await signIn(page, CUSTOMER_ME.user.email);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
  await expect(page.getByRole("heading", { name: ME_LABELS.MENU })).toBeVisible();
  const navigation: Locator = page.getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN });
  await expect(navigation.getByRole("link", { name: ME_LABELS.MENU })).toBeVisible();
  await expect(navigation.getByRole("link", { name: ME_LABELS.MY_ORDERS })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("staff who sign in land on the dashboard, with the back-office sidebar", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(HTTP_METHODS.POST, API_PATHS.LOGIN, SIGNED_IN);
  await stubMe(api, STAFF_ME);
  await page.goto(ROUTE_PATHS.LOGIN);

  await signIn(page, STAFF_ME.user.email);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.DASHBOARD));
  await expect(page.getByRole("heading", { name: ME_LABELS.OVERVIEW })).toBeVisible();
  const navigation: Locator = await openBackofficeNavigation(page);
  await expect(navigation.getByRole("link", { name: ME_LABELS.PRODUCTS })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
