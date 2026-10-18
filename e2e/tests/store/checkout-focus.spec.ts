import { CHECKOUT_MESSAGES } from "../../../src/pages/store/menu/checkout/constants/messages";
import { addressField, placeOrderButton } from "../../support/checkout";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import { itemOf, LIMONADA, priced, quoteOf, seedCart, SMASH, stubQuote } from "../../support/menu";
import { customerPage, stubMyOrders } from "../../support/orders";
import { stubSession } from "../../support/session";

test.beforeEach(async ({ page, api }): Promise<void> => {
  await seedCart(page, CUSTOMER_ME, [itemOf(SMASH, 1), itemOf(LIMONADA, 2)]);
  await stubSession(api, CUSTOMER_ME);
  await stubMyOrders(api, customerPage([]));
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9), priced(LIMONADA, 2, 24)], 58.9));
  await page.goto(SCREEN_URLS.CHECKOUT);
  await expect(placeOrderButton(page)).toBeEnabled();
});

test("takes the customer to the CEP, the first field on screen, when the empty address is sent", async ({
  page,
}): Promise<void> => {
  await placeOrderButton(page).click();

  await expect(addressField(page, CHECKOUT_MESSAGES.ZIP_CODE)).toBeFocused();
  await expectNoHorizontalOverflow(page);
});

test("takes the customer to the first field still wrong, in the order they appear", async ({
  page,
}): Promise<void> => {
  await addressField(page, CHECKOUT_MESSAGES.ZIP_CODE).pressSequentially("01310100");
  await addressField(page, CHECKOUT_MESSAGES.STREET).fill("Avenida Paulista");

  await placeOrderButton(page).click();

  await expect(addressField(page, CHECKOUT_MESSAGES.NUMBER)).toBeFocused();
});

test("takes the customer to the UF when it is the only field left to fill", async ({
  page,
}): Promise<void> => {
  await addressField(page, CHECKOUT_MESSAGES.ZIP_CODE).pressSequentially("01310100");
  await addressField(page, CHECKOUT_MESSAGES.STREET).fill("Avenida Paulista");
  await addressField(page, CHECKOUT_MESSAGES.NUMBER).fill("1000");
  await addressField(page, CHECKOUT_MESSAGES.NEIGHBORHOOD).fill("Bela Vista");
  await addressField(page, CHECKOUT_MESSAGES.CITY).fill("São Paulo");

  await placeOrderButton(page).click();

  await expect(addressField(page, CHECKOUT_MESSAGES.STATE)).toBeFocused();
  await expectNoHorizontalOverflow(page);
});
