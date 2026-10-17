import type { Locator, Page } from "@playwright/test";
import type { AdminUser } from "../../../src/@types/users";
import { ADMIN_USER_PATHS, ERROR_CODES, HTTP_STATUS } from "../../../src/constants/api";
import {
  USER_STATUS_LABELS,
  USERS_MESSAGES,
} from "../../../src/pages/admin/users/constants/messages";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { problem } from "../../support/problems";
import {
  BRUNO,
  chooseUserAction,
  ELISA,
  openUsersScreen,
  stubUsersWith,
  userEntry,
} from "../../support/users";

const OWN_ACCOUNT_DETAIL: string = "Você não pode alterar a sua própria conta";

function confirmation(page: Page): Locator {
  return page.getByRole("alertdialog");
}

function statusOf(page: Page, user: AdminUser, status: AdminUser["status"]): Locator {
  return userEntry(page, user).getByText(USER_STATUS_LABELS[status], { exact: true });
}

test("disables a user only after confirming, then shows them disabled", async ({
  page,
  api,
}): Promise<void> => {
  const disabled: AdminUser = { ...BRUNO, status: "DISABLED", disabledAt: "2026-10-17T12:00:00Z" };
  await openUsersScreen(page, api);
  await api.respond(HTTP_METHODS.POST, ADMIN_USER_PATHS.DISABLE(BRUNO.id), disabled);
  await chooseUserAction(page, BRUNO, USERS_MESSAGES.DISABLE);
  await expect(confirmation(page)).toContainText(
    USERS_MESSAGES.DISABLE_DIALOG.DESCRIPTION(BRUNO.name),
  );
  await expectNoHorizontalOverflow(page);
  await stubUsersWith(api, disabled);

  await confirmation(page)
    .getByRole("button", { name: USERS_MESSAGES.DISABLE_DIALOG.CONFIRM })
    .click();

  await expect(page.getByText(USERS_MESSAGES.DISABLED(BRUNO.name))).toBeVisible();
  await expect(confirmation(page)).toHaveCount(0);
  await expect(statusOf(page, BRUNO, "DISABLED")).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, ADMIN_USER_PATHS.DISABLE(BRUNO.id))).toHaveLength(1);
});

test("keeps the user active when the confirmation is cancelled", async ({
  page,
  api,
}): Promise<void> => {
  await openUsersScreen(page, api);
  await api.respond(HTTP_METHODS.POST, ADMIN_USER_PATHS.DISABLE(BRUNO.id), BRUNO);
  await chooseUserAction(page, BRUNO, USERS_MESSAGES.DISABLE);

  await confirmation(page).getByRole("button", { name: USERS_MESSAGES.CANCEL }).click();

  await expect(confirmation(page)).toHaveCount(0);
  await expect(statusOf(page, BRUNO, "ACTIVE")).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, ADMIN_USER_PATHS.DISABLE(BRUNO.id))).toEqual([]);
});

test("enables a disabled user at once and shows them active", async ({
  page,
  api,
}): Promise<void> => {
  const enabled: AdminUser = { ...ELISA, status: "ACTIVE", disabledAt: null };
  await openUsersScreen(page, api);
  await api.respond(HTTP_METHODS.POST, ADMIN_USER_PATHS.ENABLE(ELISA.id), enabled);
  await stubUsersWith(api, enabled);

  await chooseUserAction(page, ELISA, USERS_MESSAGES.ENABLE);

  await expect(page.getByText(USERS_MESSAGES.ENABLED(ELISA.name))).toBeVisible();
  await expect(statusOf(page, ELISA, "ACTIVE")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("shows the API's reason when it refuses to change the admin's own account", async ({
  page,
  api,
}): Promise<void> => {
  await openUsersScreen(page, api);
  await api.respond(
    HTTP_METHODS.POST,
    ADMIN_USER_PATHS.DISABLE(BRUNO.id),
    problem(
      HTTP_STATUS.UNPROCESSABLE_CONTENT,
      ERROR_CODES.CANNOT_CHANGE_OWN_ACCOUNT,
      OWN_ACCOUNT_DETAIL,
    ),
    HTTP_STATUS.UNPROCESSABLE_CONTENT,
  );
  await chooseUserAction(page, BRUNO, USERS_MESSAGES.DISABLE);

  await confirmation(page)
    .getByRole("button", { name: USERS_MESSAGES.DISABLE_DIALOG.CONFIRM })
    .click();

  await expect(page.getByText(OWN_ACCOUNT_DETAIL)).toBeVisible();
  await expect(confirmation(page)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
