import type { Locator, Page } from "@playwright/test";
import type { Product } from "../../../src/@types/catalog";
import { ERROR_CODES, HTTP_STATUS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { PRODUCTS_MESSAGES } from "../../../src/pages/catalog/products/constants/messages";
import {
  LANCHES,
  openProductsScreen,
  PRODUCTS_PATH,
  sentBodies,
  SMASH,
  stubProductsWith,
} from "../../support/catalog";
import { HTTP_CREATED, HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { problem } from "../../support/problems";
import { chooseOption } from "../../support/select";

const UNKNOWN_CATEGORY_DETAIL: string = "Categoria informada não existe";

const COXINHA: Product = {
  ...SMASH,
  id: "0199f2a0-0000-7000-8000-0000000000a9",
  name: "Coxinha de frango",
  description: null,
  price: 34.9,
  createdAt: "2026-10-17T12:00:00Z",
};

function productForm(page: Page): Locator {
  return page.getByRole("dialog", { name: PRODUCTS_MESSAGES.FORM.CREATE_TITLE });
}

async function fillProduct(page: Page): Promise<void> {
  const form: Locator = productForm(page);
  await form.getByLabel(PRODUCTS_MESSAGES.FORM.NAME).fill(COXINHA.name);
  await form.getByLabel(PRODUCTS_MESSAGES.FORM.PRICE).fill("34,90");
  await chooseOption(page, form.getByLabel(PRODUCTS_MESSAGES.FORM.CATEGORY), LANCHES.name);
}

test("creates a product with the price typed the Brazilian way and confirms it", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsScreen(page, api);
  await api.respond(HTTP_METHODS.POST, PRODUCTS_PATH, COXINHA, HTTP_CREATED);
  await page.getByRole("button", { name: PRODUCTS_MESSAGES.NEW }).click();
  await expect(productForm(page)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await fillProduct(page);
  await stubProductsWith(api, COXINHA);

  await productForm(page).getByRole("button", { name: PRODUCTS_MESSAGES.FORM.CREATE }).click();

  await expect(page.getByText(PRODUCTS_MESSAGES.CREATED(COXINHA.name))).toBeVisible();
  await expect(productForm(page)).toHaveCount(0);
  expect(sentBodies(api, HTTP_METHODS.POST, PRODUCTS_PATH)).toEqual([
    { name: COXINHA.name, description: null, price: 34.9, categoryId: LANCHES.id },
  ]);
});

test("points out the missing fields without calling the API", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsScreen(page, api);
  await page.getByRole("button", { name: PRODUCTS_MESSAGES.NEW }).click();

  await productForm(page).getByRole("button", { name: PRODUCTS_MESSAGES.FORM.CREATE }).click();

  await expect(productForm(page).getByText(MESSAGES.VALIDATION.PRODUCT_NAME_LENGTH)).toBeVisible();
  await expect(productForm(page).getByText(MESSAGES.VALIDATION.PRICE_REQUIRED)).toBeVisible();
  await expect(productForm(page).getByText(MESSAGES.VALIDATION.CATEGORY_REQUIRED)).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, PRODUCTS_PATH)).toEqual([]);
  await expectNoHorizontalOverflow(page);
});

test("rejects a price with more than two decimals before calling the API", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsScreen(page, api);
  await page.getByRole("button", { name: PRODUCTS_MESSAGES.NEW }).click();
  await fillProduct(page);

  await productForm(page).getByLabel(PRODUCTS_MESSAGES.FORM.PRICE).fill("34,999");
  await productForm(page).getByRole("button", { name: PRODUCTS_MESSAGES.FORM.CREATE }).click();

  await expect(productForm(page).getByText(MESSAGES.VALIDATION.PRICE_INVALID)).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, PRODUCTS_PATH)).toEqual([]);
});

test("shows on the category field that the chosen category no longer exists", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsScreen(page, api);
  await api.respond(
    HTTP_METHODS.POST,
    PRODUCTS_PATH,
    problem(
      HTTP_STATUS.UNPROCESSABLE_CONTENT,
      ERROR_CODES.UNKNOWN_CATEGORY,
      UNKNOWN_CATEGORY_DETAIL,
    ),
    HTTP_STATUS.UNPROCESSABLE_CONTENT,
  );
  await page.getByRole("button", { name: PRODUCTS_MESSAGES.NEW }).click();
  await fillProduct(page);

  await productForm(page).getByRole("button", { name: PRODUCTS_MESSAGES.FORM.CREATE }).click();

  await expect(productForm(page).getByText(UNKNOWN_CATEGORY_DETAIL)).toBeVisible();
  await expect(productForm(page).getByLabel(PRODUCTS_MESSAGES.FORM.CATEGORY)).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expectNoHorizontalOverflow(page);
});
