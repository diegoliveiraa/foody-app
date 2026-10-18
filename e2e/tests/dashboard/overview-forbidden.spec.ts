import { MESSAGES } from "../../../src/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { dashboardPeriods, dashboardResponse, stubDashboard } from "../../support/dashboard";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import { stubSession } from "../../support/session";

test("shows a customer the forbidden page on the dashboard, asking the API for no numbers", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);
  await stubDashboard(api, dashboardResponse());

  await page.goto(SCREEN_URLS.DASHBOARD);

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.DASHBOARD));
  await expect(page.getByText(MESSAGES.FORBIDDEN.TITLE)).toBeVisible();
  expect(dashboardPeriods(api)).toEqual([]);
  await expectNoHorizontalOverflow(page);
});
