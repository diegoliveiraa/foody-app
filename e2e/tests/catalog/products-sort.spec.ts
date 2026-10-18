import type { Page } from "@playwright/test";
import { MESSAGES } from "../../../src/constants/messages";
import { PRODUCTS_MESSAGES } from "../../../src/pages/catalog/products/constants/messages";
import {
  entryOf,
  EVERY_PRODUCT,
  productQueries,
  productsPage,
  SMASH,
  stubCategories,
  stubProducts,
} from "../../support/catalog";
import { SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow, showsListCards } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import { chooseOption, sortOptionLabels, sortSelect } from "../../support/select";
import { stubSession } from "../../support/session";

const DEFAULT_QUERY: Record<string, string> = { page: "1", pageSize: "10", sort: "name,asc" };

async function openProducts(page: Page, api: ApiStubs): Promise<void> {
  await stubSession(api, STAFF_ME);
  await stubCategories(api);
  await stubProducts(
    api,
    productsPage(EVERY_PRODUCT, { totalItems: 25, totalPages: 3, hasNext: true }),
  );
  await page.goto(SCREEN_URLS.PRODUCTS);
  await expect(entryOf(page, SMASH.name)).toBeVisible();
}

test("offers the products' sorts in plain words above the cards, starting by name", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await openProducts(page, api);

  await expect(sortSelect(page)).toHaveText(PRODUCTS_MESSAGES.SORT_OPTIONS.NAME_ASC);
  expect(await sortOptionLabels(page)).toEqual([
    "Nome (A–Z)",
    "Nome (Z–A)",
    "Menor preço",
    "Maior preço",
    "Mais recentes",
  ]);
  await expectNoHorizontalOverflow(page);
});

test("sorts the product cards by the chosen option, back on the first page", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await openProducts(page, api);
  await page.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE }).click();
  await expect
    .poll((): Record<string, string>[] => productQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, page: "2" });

  await chooseOption(page, sortSelect(page), PRODUCTS_MESSAGES.SORT_OPTIONS.HIGHEST_PRICE);

  await expect(sortSelect(page)).toHaveText(PRODUCTS_MESSAGES.SORT_OPTIONS.HIGHEST_PRICE);
  await expect
    .poll((): Record<string, string>[] => productQueries(api))
    .toEqual([
      DEFAULT_QUERY,
      { ...DEFAULT_QUERY, page: "2" },
      { ...DEFAULT_QUERY, sort: "price,desc" },
    ]);
  await expectNoHorizontalOverflow(page);
});

test("leaves sorting the products to the column headers next to the table", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await openProducts(page, api);

  await expect(sortSelect(page)).toHaveCount(0);
});
