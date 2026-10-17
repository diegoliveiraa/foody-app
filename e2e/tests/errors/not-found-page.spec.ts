import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { UNKNOWN_URL } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { stubSignedOut } from "../../support/session";

test("shows the not-found page for an address the app does not have", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);

  await page.goto(UNKNOWN_URL);

  await expect(page.getByText(MESSAGES.NOT_FOUND.TITLE)).toBeVisible();
  await expect(page.getByText(MESSAGES.NOT_FOUND.DESCRIPTION)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("leads from the not-found page back to the start", async ({ page, api }): Promise<void> => {
  await stubSignedOut(api);
  await page.goto(UNKNOWN_URL);

  await page.getByRole("link", { name: MESSAGES.BACK_HOME }).click();

  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.LOGIN));
});
