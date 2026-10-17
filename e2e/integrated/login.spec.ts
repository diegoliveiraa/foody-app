import { expect, test, type Locator, type Page } from "@playwright/test";
import { MESSAGES } from "../../src/constants/messages";
import { ROUTE_PATHS } from "../../src/constants/routes";
import { signIn } from "../support/auth";
import { SCREEN_URLS } from "../support/constants";
import { pathIs } from "../support/layout";
import { readSeedAccounts, type SeedAccounts } from "../support/seed-accounts";

const ACCOUNTS: SeedAccounts = readSeedAccounts();

const WRONG_PASSWORD_SUFFIX: string = "-wrong";

function mainNavigation(page: Page): Locator {
  return page.getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN });
}

test("a seeded customer logs in and lands on the menu, with the store tabs", async ({
  page,
}): Promise<void> => {
  await page.goto(ROUTE_PATHS.LOGIN);

  await signIn(page, ACCOUNTS.customerEmail, ACCOUNTS.password);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
  await expect(mainNavigation(page).getByRole("link")).toHaveCount(2);
  await expect(page.getByRole("button", { name: MESSAGES.NAVIGATION.ACCOUNT })).toBeVisible();
});

test("a seeded staff member logs in and lands on the dashboard, with the sidebar", async ({
  page,
}): Promise<void> => {
  await page.goto(ROUTE_PATHS.LOGIN);

  await signIn(page, ACCOUNTS.staffEmail, ACCOUNTS.password);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.DASHBOARD));
  await expect(mainNavigation(page).getByRole("group")).not.toHaveCount(0);
  await expect(page.getByText(ACCOUNTS.staffEmail)).toBeVisible();
});

test("a wrong password keeps the user on the login page with the API's message", async ({
  page,
}): Promise<void> => {
  await page.goto(ROUTE_PATHS.LOGIN);

  await signIn(page, ACCOUNTS.customerEmail, `${ACCOUNTS.password}${WRONG_PASSWORD_SUFFIX}`);

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.LOGIN));
});

async function signInAsStaff(page: Page): Promise<void> {
  await page.goto(ROUTE_PATHS.LOGIN);
  await signIn(page, ACCOUNTS.staffEmail, ACCOUNTS.password);
  await page.waitForURL(pathIs(SCREEN_URLS.DASHBOARD));
}

test("logging out returns to the login page", async ({ page }): Promise<void> => {
  await signInAsStaff(page);

  await page.getByRole("button", { name: MESSAGES.NAVIGATION.LOGOUT }).click();

  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.LOGIN));
});

test("after logging out, a private page asks to log in again", async ({ page }): Promise<void> => {
  await signInAsStaff(page);
  await page.getByRole("button", { name: MESSAGES.NAVIGATION.LOGOUT }).click();
  await page.waitForURL(pathIs(ROUTE_PATHS.LOGIN));

  await page.goto(SCREEN_URLS.DASHBOARD);

  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.LOGIN));
});
