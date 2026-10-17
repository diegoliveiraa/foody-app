import { MESSAGES } from "../../../src/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import { myOrderUrl, orderId } from "../../support/orders";
import { stubSession } from "../../support/session";

const CUSTOMER_ORDER_URLS: readonly string[] = [
  SCREEN_URLS.MY_ORDERS,
  myOrderUrl(orderId(1042)),
  SCREEN_URLS.CHECKOUT,
];

for (const url of CUSTOMER_ORDER_URLS) {
  test(`shows staff the forbidden page on ${url}, asking the API for no orders`, async ({
    page,
    api,
  }): Promise<void> => {
    await stubSession(api, STAFF_ME);

    await page.goto(url);

    await expect(page).toHaveURL(pathIs(url));
    await expect(page.getByText(MESSAGES.FORBIDDEN.TITLE)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}
