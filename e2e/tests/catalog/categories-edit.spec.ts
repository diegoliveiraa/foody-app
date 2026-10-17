import type { Locator, Page } from "@playwright/test";
import type { Category } from "../../../src/@types/catalog";
import { CATEGORY_PATHS } from "../../../src/constants/api";
import { CATEGORIES_MESSAGES } from "../../../src/pages/catalog/categories/constants/messages";
import {
  chooseRowAction,
  entryOf,
  LANCHES,
  openCategoriesScreen,
  sentBodies,
  stubCategoriesWith,
} from "../../support/catalog";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";

const RENAMED: Category = { ...LANCHES, name: "Sanduíches", displayOrder: 5 };

function editForm(page: Page): Locator {
  return page.getByRole("dialog", { name: CATEGORIES_MESSAGES.FORM.EDIT_TITLE(LANCHES.name) });
}

test("renames and reorders a category from its row", async ({ page, api }): Promise<void> => {
  await openCategoriesScreen(page, api);
  await api.respond(HTTP_METHODS.PUT, CATEGORY_PATHS.ONE(LANCHES.id), RENAMED);

  await chooseRowAction(page, LANCHES.name, CATEGORIES_MESSAGES.EDIT);

  await expect(editForm(page).getByLabel(CATEGORIES_MESSAGES.FORM.NAME)).toHaveValue(LANCHES.name);
  await expect(editForm(page).getByLabel(CATEGORIES_MESSAGES.FORM.DISPLAY_ORDER)).toHaveValue("1");
  await expectNoHorizontalOverflow(page);
  await editForm(page).getByLabel(CATEGORIES_MESSAGES.FORM.NAME).fill(RENAMED.name);
  await editForm(page).getByLabel(CATEGORIES_MESSAGES.FORM.DISPLAY_ORDER).fill("5");
  await stubCategoriesWith(api, RENAMED);
  await editForm(page).getByRole("button", { name: CATEGORIES_MESSAGES.FORM.SAVE }).click();

  await expect(page.getByText(CATEGORIES_MESSAGES.UPDATED(RENAMED.name))).toBeVisible();
  await expect(editForm(page)).toHaveCount(0);
  await expect(entryOf(page, RENAMED.name)).toBeVisible();
  expect(sentBodies(api, HTTP_METHODS.PUT, CATEGORY_PATHS.ONE(LANCHES.id))).toEqual([
    { name: RENAMED.name, displayOrder: 5 },
  ]);
});
