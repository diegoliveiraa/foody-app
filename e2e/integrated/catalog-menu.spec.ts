import { expect, test, type Locator, type Page } from "@playwright/test";
import { MESSAGES } from "../../src/constants/messages";
import { ROUTE_PATHS } from "../../src/constants/routes";
import { CATEGORIES_MESSAGES } from "../../src/pages/catalog/categories/constants/messages";
import { PRODUCTS_MESSAGES } from "../../src/pages/catalog/products/constants/messages";
import { MENU_MESSAGES } from "../../src/pages/store/menu/list/constants/messages";
import { formatMoney } from "../../src/utils/format-money";
import { signIn } from "../support/auth";
import { chooseRowAction, entryOf } from "../support/catalog";
import { SCREEN_URLS } from "../support/constants";
import { pathIs } from "../support/layout";
import { ME_LABELS } from "../support/me";
import { addButton, bagSummary, cartBar, openBag, productCard } from "../support/menu";
import { readSeedAccounts, type SeedAccounts } from "../support/seed-accounts";
import { chooseOption } from "../support/select";

const ACCOUNTS: SeedAccounts = readSeedAccounts();

const RUN_ID: string = String(Date.now());

const CATEGORY_NAME: string = `Categoria E2E ${RUN_ID}`;

const PRODUCT_NAME: string = `Produto E2E ${RUN_ID}`;

const TYPED_PRICE: string = "23,45";

const PRICE: number = 23.45;

test.describe.configure({ mode: "serial" });

async function signInAsStaff(page: Page): Promise<void> {
  await page.goto(ROUTE_PATHS.LOGIN);
  await signIn(page, ACCOUNTS.staffEmail, ACCOUNTS.password);
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.DASHBOARD));
}

async function signInAsCustomer(page: Page): Promise<void> {
  await page.goto(ROUTE_PATHS.LOGIN);
  await signIn(page, ACCOUNTS.customerEmail, ACCOUNTS.password);
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
}

async function openStaffScreen(page: Page, label: string, url: string): Promise<void> {
  await page
    .getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN })
    .getByRole("link", { name: label })
    .click();
  await expect(page).toHaveURL(pathIs(url));
}

async function findTheRunProduct(page: Page): Promise<Locator> {
  await signInAsStaff(page);
  await openStaffScreen(page, ME_LABELS.PRODUCTS, SCREEN_URLS.PRODUCTS);
  await page.getByRole("searchbox", { name: PRODUCTS_MESSAGES.SEARCH }).fill(PRODUCT_NAME);
  const entry: Locator = entryOf(page, PRODUCT_NAME);
  await expect(entry).toHaveCount(1);
  return entry;
}

async function searchTheMenu(page: Page): Promise<void> {
  await page.getByRole("searchbox", { name: MENU_MESSAGES.SEARCH }).fill(PRODUCT_NAME);
}

test("staff creates a category for this run", async ({ page }): Promise<void> => {
  await signInAsStaff(page);
  await openStaffScreen(page, ME_LABELS.CATEGORIES, SCREEN_URLS.CATEGORIES);
  await page.getByRole("button", { name: CATEGORIES_MESSAGES.NEW }).click();
  const form: Locator = page.getByRole("dialog", { name: CATEGORIES_MESSAGES.FORM.CREATE_TITLE });
  await form.getByLabel(CATEGORIES_MESSAGES.FORM.NAME).fill(CATEGORY_NAME);

  await form.getByRole("button", { name: CATEGORIES_MESSAGES.FORM.CREATE }).click();

  await expect(page.getByText(CATEGORIES_MESSAGES.CREATED(CATEGORY_NAME))).toBeVisible();
  await expect(entryOf(page, CATEGORY_NAME)).toHaveCount(1);
});

test("staff creates a product in it, priced the Brazilian way", async ({ page }): Promise<void> => {
  await signInAsStaff(page);
  await openStaffScreen(page, ME_LABELS.PRODUCTS, SCREEN_URLS.PRODUCTS);
  await page.getByRole("button", { name: PRODUCTS_MESSAGES.NEW }).click();
  const form: Locator = page.getByRole("dialog", { name: PRODUCTS_MESSAGES.FORM.CREATE_TITLE });
  await form.getByLabel(PRODUCTS_MESSAGES.FORM.NAME).fill(PRODUCT_NAME);
  await form.getByLabel(PRODUCTS_MESSAGES.FORM.PRICE).fill(TYPED_PRICE);
  await chooseOption(page, form.getByLabel(PRODUCTS_MESSAGES.FORM.CATEGORY), CATEGORY_NAME);

  await form.getByRole("button", { name: PRODUCTS_MESSAGES.FORM.CREATE }).click();

  await expect(page.getByText(PRODUCTS_MESSAGES.CREATED(PRODUCT_NAME))).toBeVisible();
  await page.getByRole("searchbox", { name: PRODUCTS_MESSAGES.SEARCH }).fill(PRODUCT_NAME);
  await expect(entryOf(page, PRODUCT_NAME).getByText(formatMoney(PRICE))).toBeVisible();
});

test("a customer finds the product on the menu and the bag shows the API's total", async ({
  page,
}): Promise<void> => {
  await signInAsCustomer(page);
  await searchTheMenu(page);
  await expect(productCard(page, PRODUCT_NAME).getByText(formatMoney(PRICE))).toBeVisible();

  await addButton(page, PRODUCT_NAME).click();

  await expect(page.getByText(MENU_MESSAGES.ADDED(PRODUCT_NAME))).toBeVisible();
  await expect(cartBar(page)).toContainText(formatMoney(PRICE));
  await openBag(page);
  await expect(bagSummary(page)).toContainText(formatMoney(PRICE));
});

test("staff disables the product after the warning", async ({ page }): Promise<void> => {
  await findTheRunProduct(page);
  await chooseRowAction(page, PRODUCT_NAME, PRODUCTS_MESSAGES.DISABLE);

  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: PRODUCTS_MESSAGES.DISABLE_DIALOG.CONFIRM, exact: true })
    .click();

  await expect(page.getByText(PRODUCTS_MESSAGES.DISABLED(PRODUCT_NAME))).toBeVisible();
});

test("the customer's menu no longer shows the disabled product", async ({
  page,
}): Promise<void> => {
  await signInAsCustomer(page);

  await searchTheMenu(page);

  await expect(page.getByText(MENU_MESSAGES.NO_RESULTS)).toBeVisible();
  await expect(productCard(page, PRODUCT_NAME)).toHaveCount(0);
});

test("staff removes the product and the category this run created", async ({
  page,
}): Promise<void> => {
  await findTheRunProduct(page);
  await chooseRowAction(page, PRODUCT_NAME, PRODUCTS_MESSAGES.DELETE);
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: PRODUCTS_MESSAGES.DELETE_DIALOG.CONFIRM })
    .click();
  await expect(page.getByText(PRODUCTS_MESSAGES.DELETED(PRODUCT_NAME))).toBeVisible();
  await openStaffScreen(page, ME_LABELS.CATEGORIES, SCREEN_URLS.CATEGORIES);

  await chooseRowAction(page, CATEGORY_NAME, CATEGORIES_MESSAGES.DELETE);
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: CATEGORIES_MESSAGES.DELETE_DIALOG.CONFIRM })
    .click();

  await expect(page.getByText(CATEGORIES_MESSAGES.DELETED(CATEGORY_NAME))).toBeVisible();
  await expect(entryOf(page, CATEGORY_NAME)).toHaveCount(0);
});
