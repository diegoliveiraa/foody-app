import type { Locator, Page } from "@playwright/test";
import { MENU_MESSAGES } from "../../../src/pages/store/menu/list/constants/messages";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { LIMONADA, MENU_PATH, openMenu, productCard, SMASH } from "../../support/menu";

function searchBox(page: Page): Locator {
  return page.getByRole("searchbox", { name: MENU_MESSAGES.SEARCH });
}

test("filters the products by name as the customer types, without asking the API again", async ({
  page,
  api,
}): Promise<void> => {
  await openMenu(page, api);

  await searchBox(page).fill("limonáda");

  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(productCard(page, LIMONADA.name)).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Bebidas"]);
  expect(api.requests(HTTP_METHODS.GET, MENU_PATH)).toHaveLength(1);
  await expectNoHorizontalOverflow(page);
});

test("says nothing was found and clears the search back to the whole menu", async ({
  page,
  api,
}): Promise<void> => {
  await openMenu(page, api);
  await searchBox(page).fill("feijoada");
  await expect(page.getByText(MENU_MESSAGES.NO_RESULTS)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: MENU_MESSAGES.CLEAR_SEARCH }).click();

  await expect(searchBox(page)).toHaveValue("");
  await expect(productCard(page, SMASH.name)).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(4);
});
