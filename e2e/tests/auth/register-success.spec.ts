import { API_PATHS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { VALID_PASSWORD } from "../../support/auth";
import { HTTP_CREATED, HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME, ME_LABELS } from "../../support/me";
import { SIGNED_IN, stubMe, stubSignedOut } from "../../support/session";

test("a new customer who signs up is signed in and lands on the menu", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(HTTP_METHODS.POST, API_PATHS.REGISTER, SIGNED_IN, HTTP_CREATED);
  await stubMe(api, CUSTOMER_ME);
  await page.goto(ROUTE_PATHS.REGISTER);

  await page.getByLabel(MESSAGES.FIELDS.NAME).fill(CUSTOMER_ME.user.name);
  await page.getByLabel(MESSAGES.FIELDS.EMAIL).fill(CUSTOMER_ME.user.email);
  await page.getByLabel(MESSAGES.FIELDS.PASSWORD).fill(VALID_PASSWORD);
  await page.getByRole("button", { name: MESSAGES.REGISTER.SUBMIT }).click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MENU));
  await expect(page.getByRole("heading", { name: ME_LABELS.MENU })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
