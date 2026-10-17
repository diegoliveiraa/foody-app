import { MESSAGES } from "../../../src/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import { orderId, orderUrl } from "../../support/orders";
import { stubSession } from "../../support/session";

const STAFF_ORDER_URLS: readonly string[] = [
  SCREEN_URLS.ORDERS,
  SCREEN_URLS.ORDER_HISTORY,
  orderUrl(orderId(1042)),
];

for (const url of STAFF_ORDER_URLS) {
  test(`shows a customer the forbidden page on ${url}, asking the API for no orders`, async ({
    page,
    api,
  }): Promise<void> => {
    await stubSession(api, CUSTOMER_ME);

    await page.goto(url);

    await expect(page).toHaveURL(pathIs(url));
    await expect(page.getByText(MESSAGES.FORBIDDEN.TITLE)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}
