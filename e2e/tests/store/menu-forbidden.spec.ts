import { MESSAGES } from "../../../src/constants/messages";
import { MENU_MESSAGES } from "../../../src/pages/store/menu/list/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import { SMASH } from "../../support/menu";
import { stubSession } from "../../support/session";

test("shows staff the forbidden page on the menu, with nothing to add to a bag", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_ME);

  await page.goto(SCREEN_URLS.MENU);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
  await expect(page.getByText(MESSAGES.FORBIDDEN.TITLE)).toBeVisible();
  await expect(page.getByRole("button", { name: MENU_MESSAGES.ADD(SMASH.name) })).toHaveCount(0);
  await expect(page.getByRole("button", { name: new RegExp(MENU_MESSAGES.VIEW_BAG) })).toHaveCount(
    0,
  );
  await expectNoHorizontalOverflow(page);
});
