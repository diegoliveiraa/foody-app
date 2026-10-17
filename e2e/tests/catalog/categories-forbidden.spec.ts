import { MESSAGES } from "../../../src/constants/messages";
import { CATEGORIES_MESSAGES } from "../../../src/pages/catalog/categories/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import { stubSession } from "../../support/session";

test("shows a customer the forbidden page on the categories screen", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);

  await page.goto(SCREEN_URLS.CATEGORIES);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.CATEGORIES));
  await expect(page.getByText(MESSAGES.FORBIDDEN.TITLE)).toBeVisible();
  await expect(page.getByRole("button", { name: CATEGORIES_MESSAGES.NEW })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
