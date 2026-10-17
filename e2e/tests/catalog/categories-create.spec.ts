import type { Locator, Page } from "@playwright/test";
import type { Category } from "../../../src/@types/catalog";
import { ERROR_CODES, HTTP_STATUS } from "../../../src/constants/api";
import { CATEGORIES_MESSAGES } from "../../../src/pages/catalog/categories/constants/messages";
import {
  CATEGORIES_PATH,
  EVERY_CATEGORY,
  openCategoriesScreen,
  sentBodies,
  stubCategories,
} from "../../support/catalog";
import { HTTP_CREATED, HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { problem } from "../../support/problems";

const NAME_TAKEN_DETAIL: string = "Já existe uma categoria com esse nome";

const BEBIDAS: Category = {
  id: "0199f2a0-0000-7000-8000-0000000000c4",
  name: "Bebidas",
  displayOrder: 4,
  status: "ACTIVE",
  productCount: 0,
  disabledAt: null,
};

function categoryForm(page: Page): Locator {
  return page.getByRole("dialog", { name: CATEGORIES_MESSAGES.FORM.CREATE_TITLE });
}

test("creates a category placed after the last one by default", async ({
  page,
  api,
}): Promise<void> => {
  await openCategoriesScreen(page, api);
  await api.respond(HTTP_METHODS.POST, CATEGORIES_PATH, BEBIDAS, HTTP_CREATED);
  await page.getByRole("button", { name: CATEGORIES_MESSAGES.NEW }).click();
  await expect(categoryForm(page).getByLabel(CATEGORIES_MESSAGES.FORM.DISPLAY_ORDER)).toHaveValue(
    "4",
  );
  await expectNoHorizontalOverflow(page);
  await categoryForm(page).getByLabel(CATEGORIES_MESSAGES.FORM.NAME).fill(BEBIDAS.name);
  await stubCategories(api, [...EVERY_CATEGORY, BEBIDAS]);

  await categoryForm(page).getByRole("button", { name: CATEGORIES_MESSAGES.FORM.CREATE }).click();

  await expect(page.getByText(CATEGORIES_MESSAGES.CREATED(BEBIDAS.name))).toBeVisible();
  await expect(categoryForm(page)).toHaveCount(0);
  expect(sentBodies(api, HTTP_METHODS.POST, CATEGORIES_PATH)).toEqual([
    { name: BEBIDAS.name, displayOrder: 4 },
  ]);
});

test("shows on the name field that another category already has it", async ({
  page,
  api,
}): Promise<void> => {
  await openCategoriesScreen(page, api);
  await api.respond(
    HTTP_METHODS.POST,
    CATEGORIES_PATH,
    problem(HTTP_STATUS.CONFLICT, ERROR_CODES.CATEGORY_NAME_TAKEN, NAME_TAKEN_DETAIL),
    HTTP_STATUS.CONFLICT,
  );
  await page.getByRole("button", { name: CATEGORIES_MESSAGES.NEW }).click();
  await categoryForm(page).getByLabel(CATEGORIES_MESSAGES.FORM.NAME).fill("lanches");

  await categoryForm(page).getByRole("button", { name: CATEGORIES_MESSAGES.FORM.CREATE }).click();

  await expect(categoryForm(page).getByText(NAME_TAKEN_DETAIL)).toBeVisible();
  await expect(categoryForm(page).getByLabel(CATEGORIES_MESSAGES.FORM.NAME)).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expectNoHorizontalOverflow(page);
});
