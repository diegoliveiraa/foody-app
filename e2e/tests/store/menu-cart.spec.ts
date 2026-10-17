import { MENU_MESSAGES } from "../../../src/pages/store/menu/list/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import {
  addButton,
  cartBar,
  itemOf,
  LIMONADA,
  openMenu,
  priced,
  quoteBodies,
  quoteOf,
  SMASH,
  stubQuote,
} from "../../support/menu";

test("adds a product with +, says so and shows the bag bar with the total the API quoted", async ({
  page,
  api,
}): Promise<void> => {
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9)], 34.9));
  await openMenu(page, api);
  await expect(cartBar(page)).toHaveCount(0);

  await addButton(page, SMASH.name).click();

  await expect(page.getByText(MENU_MESSAGES.ADDED(SMASH.name))).toBeVisible();
  await expect(cartBar(page)).toContainText(MENU_MESSAGES.UNITS(1));
  await expect(cartBar(page)).toContainText(formatMoney(34.9));
  await expect.poll((): unknown[] => quoteBodies(api)).toEqual([{ items: [itemOf(SMASH, 1)] }]);
  await expectNoHorizontalOverflow(page);
});

test("counts every unit and asks for a new quote each time the cart changes", async ({
  page,
  api,
}): Promise<void> => {
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9)], 34.9));
  await openMenu(page, api);
  await addButton(page, SMASH.name).click();
  await expect(cartBar(page)).toContainText(formatMoney(34.9));
  await stubQuote(api, quoteOf([priced(SMASH, 2, 69.8), priced(LIMONADA, 1, 12)], 81.8));

  await addButton(page, SMASH.name).click();
  await addButton(page, LIMONADA.name).click();

  await expect(page.getByText(MENU_MESSAGES.ADDED(LIMONADA.name))).toBeVisible();
  await expect(cartBar(page)).toContainText(MENU_MESSAGES.UNITS(3));
  await expect(cartBar(page)).toContainText(formatMoney(81.8));
  await expect
    .poll((): unknown[] => quoteBodies(api))
    .toEqual([
      { items: [itemOf(SMASH, 1)] },
      { items: [itemOf(SMASH, 2)] },
      { items: [itemOf(SMASH, 2), itemOf(LIMONADA, 1)] },
    ]);
});
