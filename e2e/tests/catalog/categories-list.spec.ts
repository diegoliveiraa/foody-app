import type { Locator } from "@playwright/test";
import { HTTP_STATUS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import {
  CATEGORIES_MESSAGES,
  CATEGORY_STATUS_LABELS,
} from "../../../src/pages/catalog/categories/constants/messages";
import {
  CATEGORIES_PATH,
  entryOf,
  EVERY_CATEGORY,
  LANCHES,
  SOBREMESAS,
  stubCategories,
} from "../../support/catalog";
import { HTTP_METHODS, SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, showsListCards } from "../../support/layout";
import { ME_LABELS, STAFF_ME } from "../../support/me";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const UNAVAILABLE_DETAIL: string = "O serviço está indisponível no momento";

test("lists each category as a card below 1024px, in display order", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await stubSession(api, STAFF_ME);
  await stubCategories(api);

  await page.goto(SCREEN_URLS.CATEGORIES);

  const card: Locator = page.getByRole("article", { name: LANCHES.name });
  await expect(page.getByRole("heading", { name: ME_LABELS.CATEGORIES })).toBeVisible();
  await expect(
    card.getByText(CATEGORIES_MESSAGES.DISPLAY_ORDER_OF(LANCHES.displayOrder)),
  ).toBeVisible();
  await expect(
    card.getByText(CATEGORIES_MESSAGES.PRODUCT_COUNT(LANCHES.productCount)),
  ).toBeVisible();
  await expect(card.getByText(CATEGORY_STATUS_LABELS.ACTIVE, { exact: true })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(EVERY_CATEGORY.length);
  await expect(page.getByRole("article").first()).toHaveAccessibleName(LANCHES.name);
  await expect(page.getByRole("navigation", { name: MESSAGES.LIST.PAGINATION })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("lists the categories in a table from 1024px up", async ({ page, api }): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await stubSession(api, STAFF_ME);
  await stubCategories(api);

  await page.goto(SCREEN_URLS.CATEGORIES);

  const table: Locator = page.getByRole("table", { name: CATEGORIES_MESSAGES.LIST });
  for (const header of [
    MESSAGES.FIELDS.NAME,
    CATEGORIES_MESSAGES.COLUMNS.DISPLAY_ORDER,
    CATEGORIES_MESSAGES.COLUMNS.PRODUCTS,
    CATEGORIES_MESSAGES.COLUMNS.STATUS,
  ]) {
    await expect(table.getByRole("columnheader", { name: header })).toBeVisible();
  }
  await expect(
    entryOf(page, SOBREMESAS.name).getByText(CATEGORY_STATUS_LABELS.DISABLED, { exact: true }),
  ).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(EVERY_CATEGORY.length + 1);
  await expect(table.getByRole("button", { name: MESSAGES.FIELDS.NAME })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("says there is no category yet", async ({ page, api }): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubCategories(api, []);

  await page.goto(SCREEN_URLS.CATEGORIES);

  await expect(page.getByText(CATEGORIES_MESSAGES.EMPTY)).toBeVisible();
  await expect(page.getByRole("button", { name: CATEGORIES_MESSAGES.NEW })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("tells why the list could not be loaded", async ({ page, api }): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await api.respond(
    HTTP_METHODS.GET,
    CATEGORIES_PATH,
    problem(HTTP_STATUS.FORBIDDEN, "FORBIDDEN", UNAVAILABLE_DETAIL),
    HTTP_STATUS.FORBIDDEN,
  );

  await page.goto(SCREEN_URLS.CATEGORIES);

  await expect(page.getByText(CATEGORIES_MESSAGES.LOAD_FAILED)).toBeVisible();
  await expect(page.getByText(UNAVAILABLE_DETAIL)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
