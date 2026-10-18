import { MESSAGES } from "../../../src/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { dashboardResponse, stubDashboard } from "../../support/dashboard";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import { stubSession } from "../../support/session";

test("shows staff the forbidden page when they open the users screen", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_ME);

  await page.goto(SCREEN_URLS.ADMIN_USERS);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ADMIN_USERS));
  await expect(page.getByText(MESSAGES.FORBIDDEN.TITLE)).toBeVisible();
  await expect(page.getByText(MESSAGES.FORBIDDEN.DESCRIPTION)).toBeVisible();
  await expect(page.getByRole("link", { name: MESSAGES.BACK_HOME })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("takes staff from the forbidden page back to their home", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubDashboard(api, dashboardResponse());
  await page.goto(SCREEN_URLS.ADMIN_USERS);

  await page.getByRole("link", { name: MESSAGES.BACK_HOME }).click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.DASHBOARD));
});
