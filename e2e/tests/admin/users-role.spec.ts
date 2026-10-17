import type { Locator, Page } from "@playwright/test";
import type { AdminUser } from "../../../src/@types/users";
import { ADMIN_USER_PATHS, ERROR_CODES, HTTP_STATUS } from "../../../src/constants/api";
import {
  USER_ROLE_LABELS,
  USERS_MESSAGES,
} from "../../../src/pages/admin/users/constants/messages";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test, type RecordedRequest } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { problem } from "../../support/problems";
import { chooseOption } from "../../support/select";
import {
  ANA,
  chooseUserAction,
  GABRIEL,
  openUsersScreen,
  stubUsersWith,
  userEntry,
} from "../../support/users";

const LAST_ADMIN_DETAIL: string = "É preciso manter ao menos um administrador ativo";

function roleDialog(page: Page): Locator {
  return page.getByRole("dialog");
}

async function pickStaffFor(page: Page, name: string): Promise<void> {
  const dialog: Locator = roleDialog(page);
  await expect(
    dialog.getByRole("heading", { name: USERS_MESSAGES.ROLE_DIALOG.TITLE(name) }),
  ).toBeVisible();
  await chooseOption(
    page,
    dialog.getByLabel(USERS_MESSAGES.ROLE_DIALOG.ROLE),
    USER_ROLE_LABELS.STAFF,
  );
  await dialog.getByRole("button", { name: USERS_MESSAGES.ROLE_DIALOG.SAVE }).click();
}

test("promotes a customer to staff and confirms it", async ({ page, api }): Promise<void> => {
  const promoted: AdminUser = { ...ANA, role: "STAFF" };
  await openUsersScreen(page, api);
  await api.respond(HTTP_METHODS.PATCH, ADMIN_USER_PATHS.ROLE(ANA.id), promoted);
  await chooseUserAction(page, ANA, USERS_MESSAGES.CHANGE_ROLE);
  await stubUsersWith(api, promoted);

  await pickStaffFor(page, ANA.name);

  await expect(
    page.getByText(USERS_MESSAGES.ROLE_CHANGED(ANA.name, USER_ROLE_LABELS.STAFF)),
  ).toBeVisible();
  await expect(roleDialog(page)).toHaveCount(0);
  await expect(
    userEntry(page, ANA).getByText(USER_ROLE_LABELS.STAFF, { exact: true }),
  ).toBeVisible();
  expect(
    api
      .requests(HTTP_METHODS.PATCH, ADMIN_USER_PATHS.ROLE(ANA.id))
      .map(({ body }: RecordedRequest): unknown => body),
  ).toEqual([{ role: "STAFF" }]);
  await expectNoHorizontalOverflow(page);
});

test("keeps the dialog open with the API's reason when the last admin would lose the role", async ({
  page,
  api,
}): Promise<void> => {
  await openUsersScreen(page, api);
  await api.respond(
    HTTP_METHODS.PATCH,
    ADMIN_USER_PATHS.ROLE(GABRIEL.id),
    problem(HTTP_STATUS.UNPROCESSABLE_CONTENT, ERROR_CODES.LAST_ACTIVE_ADMIN, LAST_ADMIN_DETAIL),
    HTTP_STATUS.UNPROCESSABLE_CONTENT,
  );
  await chooseUserAction(page, GABRIEL, USERS_MESSAGES.CHANGE_ROLE);

  await pickStaffFor(page, GABRIEL.name);

  await expect(page.getByText(LAST_ADMIN_DETAIL)).toBeVisible();
  await expect(roleDialog(page)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
