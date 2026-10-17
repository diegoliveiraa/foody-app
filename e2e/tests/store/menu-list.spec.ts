import type { Locator } from "@playwright/test";
import type { MenuCategory } from "../../../src/@types/menu";
import { MENU_MESSAGES } from "../../../src/pages/store/menu/list/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { HTTP_INTERNAL_ERROR, HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import {
  addButton,
  CALABRESA,
  MENU,
  MENU_PATH,
  openMenu,
  productCard,
  SMASH,
} from "../../support/menu";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const UNAVAILABLE_DETAIL: string = "O serviço está indisponível no momento";

function categoryNames(): string[] {
  return MENU.categories.map(({ name }: MenuCategory): string => name);
}

test("shows each category as a section with its products, prices and an add button", async ({
  page,
  api,
}): Promise<void> => {
  await openMenu(page, api);

  const card: Locator = productCard(page, SMASH.name);
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(categoryNames());
  await expect(card.getByRole("heading", { name: SMASH.name })).toBeVisible();
  await expect(card.getByText(SMASH.description ?? "")).toBeVisible();
  await expect(card.getByText(formatMoney(SMASH.price))).toBeVisible();
  await expect(addButton(page, SMASH.name)).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(4);
  await expectNoHorizontalOverflow(page);
});

test("offers a chip for every category and shows only the chosen one", async ({
  page,
  api,
}): Promise<void> => {
  await openMenu(page, api);
  const chips: Locator = page.getByRole("group", { name: MENU_MESSAGES.CATEGORIES });
  await expect(chips.getByRole("button")).toHaveText([
    MENU_MESSAGES.ALL_CATEGORIES,
    ...categoryNames(),
  ]);

  await chips.getByRole("button", { name: "Pizzas" }).click();

  await expect(chips.getByRole("button", { name: "Pizzas" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Pizzas"]);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(productCard(page, CALABRESA.name)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await chips.getByRole("button", { name: MENU_MESSAGES.ALL_CATEGORIES }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(categoryNames());
});

test("says the menu is empty when no category has products", async ({
  page,
  api,
}): Promise<void> => {
  await openMenu(page, api, CUSTOMER_ME, { categories: [] });

  await expect(page.getByText(MENU_MESSAGES.EMPTY)).toBeVisible();
  await expect(page.getByRole("group", { name: MENU_MESSAGES.CATEGORIES })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("tells why the menu could not be loaded", async ({ page, api }): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);
  await api.respond(
    HTTP_METHODS.GET,
    MENU_PATH,
    problem(HTTP_INTERNAL_ERROR, "INTERNAL_ERROR", UNAVAILABLE_DETAIL),
    HTTP_INTERNAL_ERROR,
  );

  await page.goto(SCREEN_URLS.MENU);

  await expect(page.getByText(MENU_MESSAGES.LOAD_FAILED)).toBeVisible();
  await expect(page.getByText(UNAVAILABLE_DETAIL)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
