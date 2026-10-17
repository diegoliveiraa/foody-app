import { MESSAGES } from "../../../src/constants/messages";
import { PRODUCTS_MESSAGES } from "../../../src/pages/catalog/products/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import { stubSession } from "../../support/session";

test("shows a customer the forbidden page on the products screen", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);

  await page.goto(SCREEN_URLS.PRODUCTS);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.PRODUCTS));
  await expect(page.getByText(MESSAGES.FORBIDDEN.TITLE)).toBeVisible();
  await expect(page.getByRole("button", { name: PRODUCTS_MESSAGES.NEW })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
