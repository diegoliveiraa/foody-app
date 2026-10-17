import { MENU_MESSAGES } from "../../../src/pages/store/menu/list/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import {
  addButton,
  cartBar,
  cartStorageKey,
  itemOf,
  OTHER_CUSTOMER_ME,
  openMenu,
  priced,
  productCard,
  quoteBodies,
  quoteOf,
  SMASH,
  stubQuote,
} from "../../support/menu";
import { stubSession } from "../../support/session";

test("keeps the customer's bag after the page is reloaded", async ({
  page,
  api,
}): Promise<void> => {
  await stubQuote(api, quoteOf([priced(SMASH, 2, 69.8)], 69.8));
  await openMenu(page, api);
  await addButton(page, SMASH.name).click();
  await addButton(page, SMASH.name).click();
  await expect(cartBar(page)).toContainText(MENU_MESSAGES.UNITS(2));

  await page.reload();

  await expect(cartBar(page)).toContainText(MENU_MESSAGES.UNITS(2));
  await expect(cartBar(page)).toContainText(formatMoney(69.8));
  await expect
    .poll((): unknown[] => quoteBodies(api).slice(-1))
    .toEqual([{ items: [itemOf(SMASH, 2)] }]);
  await expectNoHorizontalOverflow(page);
});

test("does not show one customer's bag to another customer on the same browser", async ({
  page,
  api,
}): Promise<void> => {
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9)], 34.9));
  await openMenu(page, api);
  await addButton(page, SMASH.name).click();
  await expect(cartBar(page)).toBeVisible();
  await stubSession(api, OTHER_CUSTOMER_ME);

  await page.reload();

  await expect(productCard(page, SMASH.name)).toBeVisible();
  await expect(cartBar(page)).toHaveCount(0);
  expect(
    await page.evaluate(
      (key: string): string | null => localStorage.getItem(key),
      cartStorageKey(CUSTOMER_ME),
    ),
  ).toBe(JSON.stringify([itemOf(SMASH, 1)]));
});
