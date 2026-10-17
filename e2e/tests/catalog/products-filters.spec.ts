import type { Locator, Page } from "@playwright/test";
import { MESSAGES } from "../../../src/constants/messages";
import {
  PRODUCTS_MESSAGES,
  STATUS_FILTER_LABELS,
} from "../../../src/pages/catalog/products/constants/messages";
import {
  EVERY_PRODUCT,
  PIZZAS,
  productQueries,
  productsPage,
  stubCategories,
  stubProducts,
} from "../../support/catalog";
import { SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow, showsListCards } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import { chooseOption } from "../../support/select";
import { stubSession } from "../../support/session";

const MANY_PAGES: number = 3;

const DEFAULT_QUERY: Record<string, string> = { page: "1", pageSize: "10", sort: "name,asc" };

async function openProductsOnManyPages(page: Page, api: ApiStubs): Promise<void> {
  await stubSession(api, STAFF_ME);
  await stubCategories(api);
  await stubProducts(
    api,
    productsPage(EVERY_PRODUCT, { totalItems: 25, totalPages: MANY_PAGES, hasNext: true }),
  );
  await page.goto(SCREEN_URLS.PRODUCTS);
}

async function goToSecondPage(page: Page, api: ApiStubs): Promise<void> {
  await page.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE }).click();
  await expect
    .poll((): Record<string, string>[] => productQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, page: "2" });
}

function searchBox(page: Page): Locator {
  return page.getByRole("searchbox", { name: PRODUCTS_MESSAGES.SEARCH });
}

test("first asks for page 1 of 10 products by name, without search or filters", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsOnManyPages(page, api);

  await expect(searchBox(page)).toBeVisible();
  await expect.poll((): Record<string, string>[] => productQueries(api)).toEqual([DEFAULT_QUERY]);
  await expectNoHorizontalOverflow(page);
});

test("searches on the first page once the typing settles", async ({ page, api }): Promise<void> => {
  await openProductsOnManyPages(page, api);
  await goToSecondPage(page, api);

  await searchBox(page).pressSequentially("smash");

  await expect
    .poll((): Record<string, string>[] => productQueries(api))
    .toEqual([
      DEFAULT_QUERY,
      { ...DEFAULT_QUERY, page: "2" },
      { ...DEFAULT_QUERY, search: "smash" },
    ]);
});

test("filters by category and by status, going back to the first page", async ({
  page,
  api,
}): Promise<void> => {
  await openProductsOnManyPages(page, api);
  await goToSecondPage(page, api);

  await chooseOption(
    page,
    page.getByRole("combobox", { name: PRODUCTS_MESSAGES.CATEGORY_FILTER }),
    PIZZAS.name,
  );
  await chooseOption(
    page,
    page.getByRole("combobox", { name: PRODUCTS_MESSAGES.STATUS_FILTER }),
    STATUS_FILTER_LABELS.DISABLED,
  );

  await expect
    .poll((): Record<string, string>[] => productQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, categoryId: PIZZAS.id, status: "DISABLED" });
  await expect(page.getByRole("combobox", { name: PRODUCTS_MESSAGES.CATEGORY_FILTER })).toHaveText(
    PIZZAS.name,
  );
  await expectNoHorizontalOverflow(page);
});

test("sorts by price from the column header, flipping the order on a second click", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await openProductsOnManyPages(page, api);
  await goToSecondPage(page, api);
  const priceHeader: Locator = page.getByRole("columnheader", {
    name: PRODUCTS_MESSAGES.COLUMNS.PRICE,
  });

  await priceHeader.getByRole("button").click();
  await expect(priceHeader).toHaveAttribute("aria-sort", "ascending");
  await priceHeader.getByRole("button").click();

  await expect(priceHeader).toHaveAttribute("aria-sort", "descending");
  await expect
    .poll((): Record<string, string>[] => productQueries(api))
    .toEqual([
      DEFAULT_QUERY,
      { ...DEFAULT_QUERY, page: "2" },
      { ...DEFAULT_QUERY, sort: "price,asc" },
      { ...DEFAULT_QUERY, sort: "price,desc" },
    ]);
  await expectNoHorizontalOverflow(page);
});

test("changes the page size back on the first page", async ({ page, api }): Promise<void> => {
  await openProductsOnManyPages(page, api);
  await goToSecondPage(page, api);

  await chooseOption(page, page.getByRole("combobox", { name: MESSAGES.LIST.PAGE_SIZE }), "25");

  await expect
    .poll((): Record<string, string>[] => productQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, pageSize: "25" });
  await expectNoHorizontalOverflow(page);
});
