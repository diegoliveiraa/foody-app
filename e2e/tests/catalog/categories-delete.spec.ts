import type { Locator, Page } from "@playwright/test";
import type { Category } from "../../../src/@types/catalog";
import { CATEGORY_PATHS, ERROR_CODES, HTTP_STATUS } from "../../../src/constants/api";
import { CATEGORIES_MESSAGES } from "../../../src/pages/catalog/categories/constants/messages";
import {
  chooseRowAction,
  entryOf,
  EVERY_CATEGORY,
  LANCHES,
  openCategoriesScreen,
  SOBREMESAS,
  stubCategories,
  stubCategoriesWith,
} from "../../support/catalog";
import { HTTP_METHODS, HTTP_NO_CONTENT } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { problem } from "../../support/problems";

const IN_USE_DETAIL: string = "A categoria ainda tem produtos; desabilite-a em vez de excluir";

function confirmation(page: Page): Locator {
  return page.getByRole("alertdialog");
}

test("deletes an empty category after confirming", async ({ page, api }): Promise<void> => {
  await openCategoriesScreen(page, api);
  await api.respond(HTTP_METHODS.DELETE, CATEGORY_PATHS.ONE(SOBREMESAS.id), null, HTTP_NO_CONTENT);
  await chooseRowAction(page, SOBREMESAS.name, CATEGORIES_MESSAGES.DELETE);
  await expect(confirmation(page)).toContainText(
    CATEGORIES_MESSAGES.DELETE_DIALOG.TITLE(SOBREMESAS.name),
  );
  await stubCategories(
    api,
    EVERY_CATEGORY.filter((category: Category): boolean => category.id !== SOBREMESAS.id),
  );

  await confirmation(page)
    .getByRole("button", { name: CATEGORIES_MESSAGES.DELETE_DIALOG.CONFIRM })
    .click();

  await expect(page.getByText(CATEGORIES_MESSAGES.DELETED(SOBREMESAS.name))).toBeVisible();
  await expect(entryOf(page, SOBREMESAS.name)).toHaveCount(0);
  expect(api.requests(HTTP_METHODS.DELETE, CATEGORY_PATHS.ONE(SOBREMESAS.id))).toHaveLength(1);
});

test("keeps a category with products, offering to disable it instead", async ({
  page,
  api,
}): Promise<void> => {
  const disabled: Category = { ...LANCHES, status: "DISABLED", disabledAt: "2026-10-17T12:00:00Z" };
  await openCategoriesScreen(page, api);
  await api.respond(
    HTTP_METHODS.DELETE,
    CATEGORY_PATHS.ONE(LANCHES.id),
    problem(HTTP_STATUS.CONFLICT, ERROR_CODES.CATEGORY_IN_USE, IN_USE_DETAIL),
    HTTP_STATUS.CONFLICT,
  );
  await api.respond(HTTP_METHODS.POST, CATEGORY_PATHS.DISABLE(LANCHES.id), disabled);
  await chooseRowAction(page, LANCHES.name, CATEGORIES_MESSAGES.DELETE);
  await confirmation(page)
    .getByRole("button", { name: CATEGORIES_MESSAGES.DELETE_DIALOG.CONFIRM })
    .click();
  await expect(confirmation(page)).toContainText(IN_USE_DETAIL);
  await expectNoHorizontalOverflow(page);
  await stubCategoriesWith(api, disabled);

  await confirmation(page)
    .getByRole("button", { name: CATEGORIES_MESSAGES.DISABLE_INSTEAD })
    .click();

  await expect(page.getByText(CATEGORIES_MESSAGES.DISABLED(LANCHES.name))).toBeVisible();
  await expect(confirmation(page)).toHaveCount(0);
  expect(api.requests(HTTP_METHODS.POST, CATEGORY_PATHS.DISABLE(LANCHES.id))).toHaveLength(1);
});
