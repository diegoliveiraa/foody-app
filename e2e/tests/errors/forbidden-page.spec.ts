import { MESSAGES } from "../../../src/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import { stubSession } from "../../support/session";

test("names the forbidden page with a level-one heading and in the browser tab", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);

  await page.goto(SCREEN_URLS.PRODUCTS);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.PRODUCTS));
  await expect(
    page.getByRole("heading", { name: MESSAGES.FORBIDDEN.TITLE, level: 1 }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Acesso negado · Foody");
  await expect(page.getByText(MESSAGES.FORBIDDEN.DESCRIPTION)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
