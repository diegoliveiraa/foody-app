import type { Locator } from "@playwright/test";
import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { openBackofficeNavigation } from "../../support/backoffice";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { ADMIN_ME, ME_LABELS, STAFF_ME } from "../../support/me";
import { stubLogout, stubSession } from "../../support/session";

test("gives staff one sidebar group per module, without administration", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await page.goto(SCREEN_URLS.DASHBOARD);

  const navigation: Locator = await openBackofficeNavigation(page);

  const catalog: Locator = navigation.getByRole("group", { name: ME_LABELS.CATALOG });
  await expect(navigation.getByRole("group", { name: ME_LABELS.DASHBOARD })).toBeVisible();
  await expect(catalog.getByRole("link", { name: ME_LABELS.PRODUCTS })).toBeVisible();
  await expect(catalog.getByRole("link", { name: ME_LABELS.CATEGORIES })).toBeVisible();
  await expect(navigation.getByRole("group", { name: ME_LABELS.ADMIN })).toHaveCount(0);
  await expect(page.getByText(STAFF_ME.user.email)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("lets an admin reach the users screen from the sidebar", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, ADMIN_ME);
  await page.goto(SCREEN_URLS.DASHBOARD);
  const navigation: Locator = await openBackofficeNavigation(page);

  await navigation
    .getByRole("group", { name: ME_LABELS.ADMIN })
    .getByRole("link", { name: ME_LABELS.USERS })
    .click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ADMIN_USERS));
  await expect(page.getByRole("heading", { name: ME_LABELS.USERS })).toBeVisible();
  await expect(page.getByText(MESSAGES.SCREEN_PLACEHOLDER.TITLE)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("signs staff out from the sidebar", async ({ page, api }): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubLogout(api);
  await page.goto(SCREEN_URLS.DASHBOARD);
  await openBackofficeNavigation(page);

  await page.getByRole("button", { name: MESSAGES.NAVIGATION.LOGOUT }).click();

  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.LOGIN));
});
