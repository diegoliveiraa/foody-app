import type { Locator, Page } from "@playwright/test";
import type { Product } from "../../../src/@types/catalog";
import { ERROR_CODES, HTTP_STATUS, PRODUCT_PATHS } from "../../../src/constants/api";
import { PRODUCTS_MESSAGES } from "../../../src/pages/catalog/products/constants/messages";
import {
  CALABRESA,
  chooseRowAction,
  entryOf,
  EVERY_PRODUCT,
  openProductsScreen,
  productsPage,
  SMASH,
  stubProducts,
  stubProductsWith,
} from "../../support/catalog";
import { MESSAGES } from "../../../src/constants/messages";
import { HTTP_METHODS, HTTP_NO_CONTENT } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import {
  expectInsideAtEveryDialogWidth,
  expectNoHorizontalOverflow,
  stacksDialogActions,
  type BoundingBox,
} from "../../support/layout";
import { problem } from "../../support/problems";

const IN_USE_DETAIL: string = "O produto já aparece em pedidos; desabilite-o em vez de excluir";

function confirmation(page: Page): Locator {
  return page.getByRole("alertdialog");
}

async function expectDisableInsteadAsPrimary(page: Page, label: string): Promise<void> {
  const disableInstead: Locator = confirmation(page).getByRole("button", { name: label });
  const cancel: Locator = confirmation(page).getByRole("button", { name: MESSAGES.ACTIONS.CANCEL });
  await expect(disableInstead).toBeEnabled();
  await expect(cancel).toBeVisible();
  const primary: BoundingBox = await disableInstead.boundingBox();
  const secondary: BoundingBox = await cancel.boundingBox();
  if (stacksDialogActions(page)) {
    expect(primary?.y ?? 0).toBeLessThan(secondary?.y ?? 0);
    return;
  }
  expect(primary?.x ?? 0).toBeGreaterThan(secondary?.x ?? 0);
}

test("deletes a product after confirming and takes it off the list", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsScreen(page, api);
  await api.respond(HTTP_METHODS.DELETE, PRODUCT_PATHS.ONE(CALABRESA.id), null, HTTP_NO_CONTENT);
  await chooseRowAction(page, CALABRESA.name, PRODUCTS_MESSAGES.DELETE);
  await expect(confirmation(page)).toContainText(
    PRODUCTS_MESSAGES.DELETE_DIALOG.TITLE(CALABRESA.name),
  );
  await stubProducts(
    api,
    productsPage(EVERY_PRODUCT.filter((product: Product): boolean => product.id !== CALABRESA.id)),
  );

  await confirmation(page)
    .getByRole("button", { name: PRODUCTS_MESSAGES.DELETE_DIALOG.CONFIRM })
    .click();

  await expect(page.getByText(PRODUCTS_MESSAGES.DELETED(CALABRESA.name))).toBeVisible();
  await expect(confirmation(page)).toHaveCount(0);
  await expect(entryOf(page, CALABRESA.name)).toHaveCount(0);
  expect(api.requests(HTTP_METHODS.DELETE, PRODUCT_PATHS.ONE(CALABRESA.id))).toHaveLength(1);
});

test("keeps the dialog open with the API's reason and disables the product instead", async ({
  page,
  api,
}): Promise<void> => {
  const disabled: Product = { ...SMASH, status: "DISABLED", disabledAt: "2026-10-17T12:00:00Z" };
  await openProductsScreen(page, api);
  await api.respond(
    HTTP_METHODS.DELETE,
    PRODUCT_PATHS.ONE(SMASH.id),
    problem(HTTP_STATUS.CONFLICT, ERROR_CODES.PRODUCT_IN_USE, IN_USE_DETAIL),
    HTTP_STATUS.CONFLICT,
  );
  await api.respond(HTTP_METHODS.POST, PRODUCT_PATHS.DISABLE(SMASH.id), disabled);
  await chooseRowAction(page, SMASH.name, PRODUCTS_MESSAGES.DELETE);
  await confirmation(page)
    .getByRole("button", { name: PRODUCTS_MESSAGES.DELETE_DIALOG.CONFIRM })
    .click();
  await expect(confirmation(page)).toContainText(IN_USE_DETAIL);
  await expect(
    confirmation(page).getByRole("button", { name: PRODUCTS_MESSAGES.DELETE_DIALOG.CONFIRM }),
  ).toHaveCount(0);
  await expectDisableInsteadAsPrimary(page, PRODUCTS_MESSAGES.DISABLE_INSTEAD);
  await expectNoHorizontalOverflow(page);
  await stubProductsWith(api, disabled);

  await confirmation(page).getByRole("button", { name: PRODUCTS_MESSAGES.DISABLE_INSTEAD }).click();

  await expect(page.getByText(PRODUCTS_MESSAGES.DISABLED(SMASH.name))).toBeVisible();
  await expect(confirmation(page)).toHaveCount(0);
  expect(api.requests(HTTP_METHODS.POST, PRODUCT_PATHS.DISABLE(SMASH.id))).toHaveLength(1);
});

test("keeps the delete dialog, its reason and its actions inside the dialog at every width", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsScreen(page, api);
  await api.respond(
    HTTP_METHODS.DELETE,
    PRODUCT_PATHS.ONE(SMASH.id),
    problem(HTTP_STATUS.CONFLICT, ERROR_CODES.PRODUCT_IN_USE, IN_USE_DETAIL),
    HTTP_STATUS.CONFLICT,
  );
  await chooseRowAction(page, SMASH.name, PRODUCTS_MESSAGES.DELETE);
  await expectInsideAtEveryDialogWidth(page, confirmation(page));

  await confirmation(page)
    .getByRole("button", { name: PRODUCTS_MESSAGES.DELETE_DIALOG.CONFIRM })
    .click();

  await expect(confirmation(page)).toContainText(IN_USE_DETAIL);
  await expectInsideAtEveryDialogWidth(page, confirmation(page));
  await expectDisableInsteadAsPrimary(page, PRODUCTS_MESSAGES.DISABLE_INSTEAD);
});
