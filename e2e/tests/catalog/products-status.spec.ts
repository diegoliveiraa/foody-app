import type { Locator, Page } from "@playwright/test";
import type { Product } from "../../../src/@types/catalog";
import { PRODUCT_PATHS } from "../../../src/constants/api";
import {
  PRODUCT_STATUS_LABELS,
  PRODUCTS_MESSAGES,
} from "../../../src/pages/catalog/products/constants/messages";
import {
  chooseRowAction,
  entryOf,
  FRANGO,
  openProductsScreen,
  SMASH,
  stubProductsWith,
} from "../../support/catalog";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";

function confirmation(page: Page): Locator {
  return page.getByRole("alertdialog");
}

function statusOf(page: Page, product: Product, status: Product["status"]): Locator {
  return entryOf(page, product.name).getByText(PRODUCT_STATUS_LABELS[status], { exact: true });
}

test("disables a product only after warning it leaves the menu", async ({
  page,
  api,
}): Promise<void> => {
  const disabled: Product = { ...SMASH, status: "DISABLED", disabledAt: "2026-10-17T12:00:00Z" };
  await openProductsScreen(page, api);
  await api.respond(HTTP_METHODS.POST, PRODUCT_PATHS.DISABLE(SMASH.id), disabled);
  await chooseRowAction(page, SMASH.name, PRODUCTS_MESSAGES.DISABLE);
  await expect(confirmation(page)).toContainText(
    PRODUCTS_MESSAGES.DISABLE_DIALOG.DESCRIPTION(SMASH.name),
  );
  await expectNoHorizontalOverflow(page);
  await stubProductsWith(api, disabled);

  await confirmation(page)
    .getByRole("button", { name: PRODUCTS_MESSAGES.DISABLE_DIALOG.CONFIRM, exact: true })
    .click();

  await expect(page.getByText(PRODUCTS_MESSAGES.DISABLED(SMASH.name))).toBeVisible();
  await expect(confirmation(page)).toHaveCount(0);
  await expect(statusOf(page, SMASH, "DISABLED")).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, PRODUCT_PATHS.DISABLE(SMASH.id))).toHaveLength(1);
});

test("keeps the product active when the warning is cancelled", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsScreen(page, api);
  await chooseRowAction(page, SMASH.name, PRODUCTS_MESSAGES.DISABLE);

  await confirmation(page).getByRole("button", { name: PRODUCTS_MESSAGES.FORM.CANCEL }).click();

  await expect(confirmation(page)).toHaveCount(0);
  await expect(statusOf(page, SMASH, "ACTIVE")).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, PRODUCT_PATHS.DISABLE(SMASH.id))).toEqual([]);
});

test("enables a disabled product at once", async ({ page, api }): Promise<void> => {
  const enabled: Product = { ...FRANGO, status: "ACTIVE", disabledAt: null };
  await openProductsScreen(page, api);
  await api.respond(HTTP_METHODS.POST, PRODUCT_PATHS.ENABLE(FRANGO.id), enabled);
  await stubProductsWith(api, enabled);

  await chooseRowAction(page, FRANGO.name, PRODUCTS_MESSAGES.ENABLE);

  await expect(page.getByText(PRODUCTS_MESSAGES.ENABLED(FRANGO.name))).toBeVisible();
  await expect(statusOf(page, FRANGO, "ACTIVE")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
