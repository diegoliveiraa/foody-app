import { MENU_MESSAGES } from "../../../src/pages/store/menu/list/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import {
  bag,
  bagLine,
  bagSummary,
  BROWNIE_ID,
  BROWNIE_NAME,
  continueButton,
  itemOf,
  LIMONADA,
  openBag,
  openMenu,
  priced,
  quoteBodies,
  quoteOf,
  seedCart,
  SMASH,
  stubQuote,
  unavailable,
} from "../../support/menu";

test("lists the bag with the unit prices, subtotals and total the API quoted", async ({
  page,
  api,
}): Promise<void> => {
  await seedCart(page, CUSTOMER_ME, [itemOf(SMASH, 2), itemOf(LIMONADA, 1)]);
  await stubQuote(api, quoteOf([priced(SMASH, 2, 69.8), priced(LIMONADA, 1, 12)], 81.8));
  await openMenu(page, api);

  await openBag(page);

  await expect(bagLine(page, SMASH.name)).toContainText(
    MENU_MESSAGES.BAG.EACH(formatMoney(SMASH.price)),
  );
  await expect(bagLine(page, SMASH.name)).toContainText(formatMoney(69.8));
  await expect(bagLine(page, LIMONADA.name)).toContainText(formatMoney(12));
  await expect(bagSummary(page)).toContainText(formatMoney(81.8));
  await expect(continueButton(page)).toBeEnabled();
  await expectNoHorizontalOverflow(page);
});

test("re-quotes the bag after each +, − and remove", async ({ page, api }): Promise<void> => {
  await seedCart(page, CUSTOMER_ME, [itemOf(SMASH, 2), itemOf(LIMONADA, 1)]);
  await stubQuote(api, quoteOf([priced(SMASH, 2, 69.8), priced(LIMONADA, 1, 12)], 81.8));
  await openMenu(page, api);
  await openBag(page);
  await expect(bagSummary(page)).toContainText(formatMoney(81.8));
  await stubQuote(api, quoteOf([priced(SMASH, 2, 69.8), priced(LIMONADA, 2, 24)], 93.8));

  await bag(page)
    .getByRole("button", { name: MENU_MESSAGES.BAG.INCREASE(LIMONADA.name) })
    .click();
  await expect(bagSummary(page)).toContainText(formatMoney(93.8));
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9), priced(LIMONADA, 2, 24)], 58.9));
  await bag(page)
    .getByRole("button", { name: MENU_MESSAGES.BAG.DECREASE(SMASH.name) })
    .click();
  await expect(bagSummary(page)).toContainText(formatMoney(58.9));
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9)], 34.9));
  await bag(page)
    .getByRole("button", { name: MENU_MESSAGES.BAG.REMOVE(LIMONADA.name) })
    .click();

  await expect(bagSummary(page)).toContainText(formatMoney(34.9));
  await expect(bagLine(page, LIMONADA.name)).toHaveCount(0);
  await expect
    .poll((): unknown[] => quoteBodies(api))
    .toEqual([
      { items: [itemOf(SMASH, 2), itemOf(LIMONADA, 1)] },
      { items: [itemOf(SMASH, 2), itemOf(LIMONADA, 2)] },
      { items: [itemOf(SMASH, 1), itemOf(LIMONADA, 2)] },
      { items: [itemOf(SMASH, 1)] },
    ]);
  await expectNoHorizontalOverflow(page);
});

test("empties the bag when the last unit is taken out and does not let the customer continue", async ({
  page,
  api,
}): Promise<void> => {
  await seedCart(page, CUSTOMER_ME, [itemOf(SMASH, 1)]);
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9)], 34.9));
  await openMenu(page, api);
  await openBag(page);

  await bag(page)
    .getByRole("button", { name: MENU_MESSAGES.BAG.DECREASE(SMASH.name) })
    .click();

  await expect(bag(page).getByText(MENU_MESSAGES.BAG.EMPTY)).toBeVisible();
  await expect(continueButton(page)).toBeDisabled();
  expect(quoteBodies(api)).toHaveLength(1);
});

test("marks an unavailable item and lets the customer continue only after removing it", async ({
  page,
  api,
}): Promise<void> => {
  await seedCart(page, CUSTOMER_ME, [itemOf(SMASH, 1), { productId: BROWNIE_ID, quantity: 1 }]);
  await stubQuote(
    api,
    quoteOf([priced(SMASH, 1, 34.9), unavailable(BROWNIE_ID, BROWNIE_NAME, 1)], 34.9),
  );
  await openMenu(page, api);
  await openBag(page);

  await expect(bagLine(page, BROWNIE_NAME)).toContainText(MENU_MESSAGES.BAG.UNAVAILABLE);
  await expect(bag(page).getByText(MENU_MESSAGES.BAG.UNAVAILABLE_NOTICE)).toBeVisible();
  await expect(continueButton(page)).toBeDisabled();
  await expectNoHorizontalOverflow(page);
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9)], 34.9));
  await bag(page)
    .getByRole("button", { name: MENU_MESSAGES.BAG.REMOVE(BROWNIE_NAME) })
    .click();

  await expect(bagLine(page, BROWNIE_NAME)).toHaveCount(0);
  await expect(continueButton(page)).toBeEnabled();
  await continueButton(page).click();
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.CHECKOUT));
});
