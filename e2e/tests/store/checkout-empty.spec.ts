import { CHECKOUT_MESSAGES } from "../../../src/pages/store/menu/checkout/constants/messages";
import { placeOrderButton } from "../../support/checkout";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME, ME_LABELS } from "../../support/me";
import { quoteBodies, stubMenu } from "../../support/menu";
import { stubSession } from "../../support/session";

test("shows an empty bag with a way back to the menu, asking for no quote", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);
  await stubMenu(api);
  await page.goto(SCREEN_URLS.CHECKOUT);

  await expect(page.getByText(CHECKOUT_MESSAGES.EMPTY)).toBeVisible();
  await expect(placeOrderButton(page)).toHaveCount(0);
  expect(quoteBodies(api)).toEqual([]);
  await expectNoHorizontalOverflow(page);
  await page.getByRole("link", { name: CHECKOUT_MESSAGES.BROWSE_MENU }).click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
  await expect(page.getByRole("heading", { name: ME_LABELS.MENU, level: 1 })).toBeVisible();
});
