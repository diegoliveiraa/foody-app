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
import { ROUTE_PATHS } from "../../src/constants/routes";
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  USERS_MESSAGES,
} from "../../src/pages/admin/users/constants/messages";
import { signIn, VALID_PASSWORD } from "../support/auth";
import { HTTP_CREATED, INTEGRATED_API_URL, SCREEN_URLS } from "../support/constants";
import { pathIs } from "../support/layout";
import { ME_LABELS } from "../support/me";
import { readSeedAccounts, type SeedAccounts } from "../support/seed-accounts";
import { chooseOption } from "../support/select";
import { chooseUserAction, userEntry } from "../support/users";

const ACCOUNTS: SeedAccounts = readSeedAccounts();

const RUN_ID: string = String(Date.now());

const NEW_CUSTOMER: RegisterRequest = {
  name: `Cliente E2E ${RUN_ID}`,
  email: `cliente.${RUN_ID}@e2e.foody.dev`,
  password: VALID_PASSWORD,
};

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ playwright }): Promise<void> => {
  const api: APIRequestContext = await playwright.request.newContext({
    baseURL: INTEGRATED_API_URL,
  });
  const registered: APIResponse = await api.post(API_PATHS.REGISTER, { data: NEW_CUSTOMER });
  expect(registered.status(), "registering the customer this run changes").toBe(HTTP_CREATED);
  await api.dispose();
});

async function findNewCustomerAsAdmin(page: Page): Promise<Locator> {
  await page.goto(ROUTE_PATHS.LOGIN);
  await signIn(page, ACCOUNTS.adminEmail, ACCOUNTS.adminPassword);
  await page
    .getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN })
    .getByRole("link", { name: ME_LABELS.USERS })
    .click();
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ADMIN_USERS));
  await page.getByRole("searchbox", { name: USERS_MESSAGES.SEARCH }).fill(NEW_CUSTOMER.email);
  const entry: Locator = userEntry(page, NEW_CUSTOMER);
  await expect(entry).toHaveCount(1);
  return entry;
}

function badge(entry: Locator, label: string): Locator {
  return entry.getByText(label, { exact: true });
}

test("an admin finds the customer who just signed up, active and as a customer", async ({
  page,
}): Promise<void> => {
  const entry: Locator = await findNewCustomerAsAdmin(page);

  await expect(badge(entry, USER_ROLE_LABELS.CUSTOMER)).toBeVisible();
  await expect(badge(entry, USER_STATUS_LABELS.ACTIVE)).toBeVisible();
});

test("an admin promotes the new customer to staff", async ({ page }): Promise<void> => {
  const entry: Locator = await findNewCustomerAsAdmin(page);
  await chooseUserAction(page, NEW_CUSTOMER, USERS_MESSAGES.CHANGE_ROLE);
  const dialog: Locator = page.getByRole("dialog");
  await chooseOption(
    page,
    dialog.getByLabel(USERS_MESSAGES.ROLE_DIALOG.ROLE),
    USER_ROLE_LABELS.STAFF,
  );

  await dialog.getByRole("button", { name: USERS_MESSAGES.ROLE_DIALOG.SAVE }).click();

  await expect(
    page.getByText(USERS_MESSAGES.ROLE_CHANGED(NEW_CUSTOMER.name, USER_ROLE_LABELS.STAFF)),
  ).toBeVisible();
  await expect(badge(entry, USER_ROLE_LABELS.STAFF)).toBeVisible();
});

test("an admin disables the new staff member after confirming", async ({ page }): Promise<void> => {
  const entry: Locator = await findNewCustomerAsAdmin(page);
  await chooseUserAction(page, NEW_CUSTOMER, USERS_MESSAGES.DISABLE);

  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: USERS_MESSAGES.DISABLE_DIALOG.CONFIRM })
    .click();

  await expect(page.getByText(USERS_MESSAGES.DISABLED(NEW_CUSTOMER.name))).toBeVisible();
  await expect(badge(entry, USER_STATUS_LABELS.DISABLED)).toBeVisible();
});

test("an admin enables the disabled staff member again", async ({ page }): Promise<void> => {
  const entry: Locator = await findNewCustomerAsAdmin(page);

  await chooseUserAction(page, NEW_CUSTOMER, USERS_MESSAGES.ENABLE);

  await expect(page.getByText(USERS_MESSAGES.ENABLED(NEW_CUSTOMER.name))).toBeVisible();
  await expect(badge(entry, USER_STATUS_LABELS.ACTIVE)).toBeVisible();
});
