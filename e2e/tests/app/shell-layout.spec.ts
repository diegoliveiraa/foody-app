import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { stubSignedOut } from "../../support/session";

test("opens a signed-out visitor on the login page, without horizontal overflow", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);

  await page.goto(ROUTE_PATHS.HOME);

  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.LOGIN));
  await expect(page.getByRole("heading", { name: MESSAGES.LOGIN.TITLE })).toBeVisible();
  await expect(page).toHaveTitle("Entrar · Foody");
  await expectNoHorizontalOverflow(page);
});
