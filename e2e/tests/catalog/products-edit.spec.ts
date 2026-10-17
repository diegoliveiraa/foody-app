import type { Locator, Page } from "@playwright/test";
import type { Product } from "../../../src/@types/catalog";
import { PRODUCT_PATHS } from "../../../src/constants/api";
import { PRODUCTS_MESSAGES } from "../../../src/pages/catalog/products/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import {
  chooseRowAction,
  entryOf,
  openProductsScreen,
  sentBodies,
  SMASH,
  stubProductsWith,
} from "../../support/catalog";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";

const REPRICED: Product = { ...SMASH, price: 36.5 };

function editForm(page: Page): Locator {
  return page.getByRole("dialog", { name: PRODUCTS_MESSAGES.FORM.EDIT_TITLE(SMASH.name) });
}

test("edits a product from its row, starting from what it has today", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsScreen(page, api);
  await api.respond(HTTP_METHODS.PUT, PRODUCT_PATHS.ONE(SMASH.id), REPRICED);

  await chooseRowAction(page, SMASH.name, PRODUCTS_MESSAGES.EDIT);

  await expect(editForm(page).getByLabel(PRODUCTS_MESSAGES.FORM.NAME)).toHaveValue(SMASH.name);
  await expect(editForm(page).getByLabel(PRODUCTS_MESSAGES.FORM.PRICE)).toHaveValue("34,90");
  await expect(editForm(page).getByLabel(PRODUCTS_MESSAGES.FORM.CATEGORY)).toHaveText(
    SMASH.category.name,
  );
  await expectNoHorizontalOverflow(page);
  await editForm(page).getByLabel(PRODUCTS_MESSAGES.FORM.PRICE).fill("36.5");
  await stubProductsWith(api, REPRICED);
  await editForm(page).getByRole("button", { name: PRODUCTS_MESSAGES.FORM.SAVE }).click();

  await expect(page.getByText(PRODUCTS_MESSAGES.UPDATED(SMASH.name))).toBeVisible();
  await expect(editForm(page)).toHaveCount(0);
  await expect(entryOf(page, SMASH.name).getByText(formatMoney(36.5))).toBeVisible();
  expect(sentBodies(api, HTTP_METHODS.PUT, PRODUCT_PATHS.ONE(SMASH.id))).toEqual([
    {
      name: SMASH.name,
      description: SMASH.description,
      price: 36.5,
      categoryId: SMASH.category.id,
    },
  ]);
});
