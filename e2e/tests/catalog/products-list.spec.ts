import type { Locator } from "@playwright/test";
import type { MeModule, MeResponse, MeScreen, ScreenAction } from "../../../src/@types/me";
import { HTTP_STATUS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import {
  PRODUCT_STATUS_LABELS,
  PRODUCTS_MESSAGES,
} from "../../../src/pages/catalog/products/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import {
  entryOf,
  EVERY_PRODUCT,
  FRANGO,
  PRODUCTS_PATH,
  productsPage,
  SMASH,
  stubCategories,
  stubProducts,
} from "../../support/catalog";
import { HTTP_METHODS, SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, showsListCards } from "../../support/layout";
import { ME_LABELS, STAFF_ME } from "../../support/me";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const FORBIDDEN_DETAIL: string = "Você não tem permissão para acessar este recurso";

const PRODUCTS_SCREEN_KEY: string = "catalog.products";

function staffWithProductActions(actions: ScreenAction[]): MeResponse {
  return {
    ...STAFF_ME,
    modules: STAFF_ME.modules.map((module: MeModule): MeModule => ({
      ...module,
      screens: module.screens.map((screen: MeScreen): MeScreen =>
        screen.key === PRODUCTS_SCREEN_KEY ? { ...screen, actions } : screen,
      ),
    })),
  };
}

test("lists each product as a card below 1024px", async ({ page, api }): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await stubSession(api, STAFF_ME);
  await stubCategories(api);
  await stubProducts(api, productsPage(EVERY_PRODUCT));

  await page.goto(SCREEN_URLS.PRODUCTS);

  const card: Locator = page.getByRole("article", { name: SMASH.name });
  await expect(page.getByRole("heading", { name: ME_LABELS.PRODUCTS })).toBeVisible();
  await expect(card.getByText(SMASH.category.name)).toBeVisible();
  await expect(card.getByText(formatMoney(SMASH.price))).toBeVisible();
  await expect(card.getByText(PRODUCT_STATUS_LABELS.ACTIVE, { exact: true })).toBeVisible();
  await expect(card.getByText(PRODUCTS_MESSAGES.CREATED_AT("04/03/2026"))).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(EVERY_PRODUCT.length);
  await expect(page.getByRole("table")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("lists the products in a table from 1024px up", async ({ page, api }): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await stubSession(api, STAFF_ME);
  await stubCategories(api);
  await stubProducts(api, productsPage(EVERY_PRODUCT));

  await page.goto(SCREEN_URLS.PRODUCTS);

  const table: Locator = page.getByRole("table", { name: PRODUCTS_MESSAGES.LIST });
  for (const header of [
    MESSAGES.FIELDS.NAME,
    PRODUCTS_MESSAGES.COLUMNS.CATEGORY,
    PRODUCTS_MESSAGES.COLUMNS.PRICE,
    PRODUCTS_MESSAGES.COLUMNS.STATUS,
    PRODUCTS_MESSAGES.COLUMNS.CREATED_AT,
  ]) {
    await expect(table.getByRole("columnheader", { name: header })).toBeVisible();
  }
  const row: Locator = entryOf(page, FRANGO.name);
  await expect(row.getByText(formatMoney(FRANGO.price))).toBeVisible();
  await expect(row.getByText(PRODUCT_STATUS_LABELS.DISABLED, { exact: true })).toBeVisible();
  await expect(row.getByText("15/01/2026")).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(EVERY_PRODUCT.length + 1);
  await expectNoHorizontalOverflow(page);
});

test("offers creating and the row actions only as /me grants them", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, staffWithProductActions(["UPDATE"]));
  await stubCategories(api);
  await stubProducts(api, productsPage(EVERY_PRODUCT));
  await page.goto(SCREEN_URLS.PRODUCTS);

  await entryOf(page, SMASH.name)
    .getByRole("button", { name: MESSAGES.ACTIONS.FOR(SMASH.name) })
    .click();

  await expect(page.getByRole("menuitem", { name: PRODUCTS_MESSAGES.EDIT })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: PRODUCTS_MESSAGES.DISABLE })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: PRODUCTS_MESSAGES.DELETE })).toHaveCount(0);
  await expect(page.getByRole("button", { name: PRODUCTS_MESSAGES.NEW })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("says no product was found and clears the search and filters", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubCategories(api);
  await stubProducts(api, productsPage([]));
  await page.goto(SCREEN_URLS.PRODUCTS);
  const search: Locator = page.getByRole("searchbox", { name: PRODUCTS_MESSAGES.SEARCH });

  await search.fill("feijoada");

  const clear: Locator = page.getByRole("button", { name: PRODUCTS_MESSAGES.CLEAR_FILTERS });
  await expect(page.getByText(PRODUCTS_MESSAGES.EMPTY)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await clear.click();
  await expect(search).toHaveValue("");
  await expect(clear).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: MESSAGES.LIST.PAGINATION })).toHaveCount(0);
});

test("tells why the list could not be loaded", async ({ page, api }): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubCategories(api);
  await api.respond(
    HTTP_METHODS.GET,
    PRODUCTS_PATH,
    problem(HTTP_STATUS.FORBIDDEN, "FORBIDDEN", FORBIDDEN_DETAIL),
    HTTP_STATUS.FORBIDDEN,
  );

  await page.goto(SCREEN_URLS.PRODUCTS);

  await expect(page.getByText(PRODUCTS_MESSAGES.LOAD_FAILED)).toBeVisible();
  await expect(page.getByText(FORBIDDEN_DETAIL)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
