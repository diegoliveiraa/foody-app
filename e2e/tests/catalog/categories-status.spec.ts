import type { Locator, Page } from "@playwright/test";
import type { Category } from "../../../src/@types/catalog";
import { CATEGORY_PATHS } from "../../../src/constants/api";
import {
  CATEGORIES_MESSAGES,
  CATEGORY_STATUS_LABELS,
} from "../../../src/pages/catalog/categories/constants/messages";
import {
  chooseRowAction,
  entryOf,
  LANCHES,
  openCategoriesScreen,
  PIZZAS,
  SOBREMESAS,
  stubCategoriesWith,
} from "../../support/catalog";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";

const LANCHES_PRODUCTS_LEAVE: string = "Os 2 produtos desta categoria somem do cardápio.";

const PIZZAS_PRODUCT_LEAVES: string = "1 produto desta categoria some do cardápio.";

function confirmation(page: Page): Locator {
  return page.getByRole("alertdialog");
}

function statusOf(page: Page, category: Category, status: Category["status"]): Locator {
  return entryOf(page, category.name).getByText(CATEGORY_STATUS_LABELS[status], { exact: true });
}

test("disables a category only after warning how many products leave the menu", async ({
  page,
  api,
}): Promise<void> => {
  const disabled: Category = { ...LANCHES, status: "DISABLED", disabledAt: "2026-10-17T12:00:00Z" };
  await openCategoriesScreen(page, api);
  await api.respond(HTTP_METHODS.POST, CATEGORY_PATHS.DISABLE(LANCHES.id), disabled);
  await chooseRowAction(page, LANCHES.name, CATEGORIES_MESSAGES.DISABLE);
  await expect(
    confirmation(page).getByRole("heading", {
      name: CATEGORIES_MESSAGES.DISABLE_DIALOG.TITLE(LANCHES.name),
    }),
  ).toBeVisible();
  await expect(confirmation(page)).toContainText(LANCHES_PRODUCTS_LEAVE);
  expect(api.requests(HTTP_METHODS.POST, CATEGORY_PATHS.DISABLE(LANCHES.id))).toEqual([]);
  await expectNoHorizontalOverflow(page);
  await stubCategoriesWith(api, disabled);

  await confirmation(page)
    .getByRole("button", { name: CATEGORIES_MESSAGES.DISABLE_DIALOG.CONFIRM, exact: true })
    .click();

  await expect(page.getByText(CATEGORIES_MESSAGES.DISABLED(LANCHES.name))).toBeVisible();
  await expect(confirmation(page)).toHaveCount(0);
  await expect(statusOf(page, LANCHES, "DISABLED")).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, CATEGORY_PATHS.DISABLE(LANCHES.id))).toHaveLength(1);
});

test("keeps the category active when the warning is cancelled", async ({
  page,
  api,
}): Promise<void> => {
  await openCategoriesScreen(page, api);
  await chooseRowAction(page, PIZZAS.name, CATEGORIES_MESSAGES.DISABLE);
  await expect(confirmation(page)).toContainText(PIZZAS_PRODUCT_LEAVES);

  await confirmation(page).getByRole("button", { name: CATEGORIES_MESSAGES.FORM.CANCEL }).click();

  await expect(confirmation(page)).toHaveCount(0);
  await expect(statusOf(page, PIZZAS, "ACTIVE")).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, CATEGORY_PATHS.DISABLE(PIZZAS.id))).toEqual([]);
});

test("enables a disabled category at once", async ({ page, api }): Promise<void> => {
  const enabled: Category = { ...SOBREMESAS, status: "ACTIVE", disabledAt: null };
  await openCategoriesScreen(page, api);
  await api.respond(HTTP_METHODS.POST, CATEGORY_PATHS.ENABLE(SOBREMESAS.id), enabled);
  await stubCategoriesWith(api, enabled);

  await chooseRowAction(page, SOBREMESAS.name, CATEGORIES_MESSAGES.ENABLE);

  await expect(page.getByText(CATEGORIES_MESSAGES.ENABLED(SOBREMESAS.name))).toBeVisible();
  await expect(statusOf(page, SOBREMESAS, "ACTIVE")).toBeVisible();
  await expect(confirmation(page)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
