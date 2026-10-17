import type { Locator } from "@playwright/test";
import { HTTP_STATUS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  USERS_MESSAGES,
} from "../../../src/pages/admin/users/constants/messages";
import { HTTP_METHODS, SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, showsListCards } from "../../support/layout";
import { ADMIN_ME, adminMeWithUserActions, ME_LABELS } from "../../support/me";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";
import {
  actionsButton,
  ANA,
  BRUNO,
  ELISA,
  EVERYONE,
  SIGNED_IN_ADMIN,
  stubUsers,
  userEntry,
  usersPage,
  USERS_PATH,
} from "../../support/users";

const FORBIDDEN_DETAIL: string = "Você não tem permissão para acessar este recurso";

test("lists each user as a card below 1024px", async ({ page, api }): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await stubSession(api, ADMIN_ME);
  await stubUsers(api, usersPage(EVERYONE));

  await page.goto(SCREEN_URLS.ADMIN_USERS);

  const card: Locator = page.getByRole("article", { name: ANA.name });
  await expect(page.getByRole("heading", { name: ME_LABELS.USERS })).toBeVisible();
  await expect(card.getByText(ANA.email)).toBeVisible();
  await expect(card.getByText(USER_ROLE_LABELS.CUSTOMER, { exact: true })).toBeVisible();
  await expect(card.getByText(USER_STATUS_LABELS.ACTIVE, { exact: true })).toBeVisible();
  await expect(card.getByText(USERS_MESSAGES.CREATED_AT("04/03/2026"))).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(EVERYONE.length);
  await expect(page.getByRole("table")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("lists the users in a table from 1024px up", async ({ page, api }): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await stubSession(api, ADMIN_ME);
  await stubUsers(api, usersPage(EVERYONE));

  await page.goto(SCREEN_URLS.ADMIN_USERS);

  const table: Locator = page.getByRole("table", { name: USERS_MESSAGES.LIST });
  const row: Locator = userEntry(page, ELISA);
  for (const header of [
    MESSAGES.FIELDS.NAME,
    MESSAGES.FIELDS.EMAIL,
    USERS_MESSAGES.COLUMNS.ROLE,
    USERS_MESSAGES.COLUMNS.STATUS,
    USERS_MESSAGES.COLUMNS.CREATED_AT,
  ]) {
    await expect(table.getByRole("columnheader", { name: header })).toBeVisible();
  }
  await expect(row.getByText(ELISA.name)).toBeVisible();
  await expect(row.getByText(USER_STATUS_LABELS.DISABLED, { exact: true })).toBeVisible();
  await expect(row.getByText("15/01/2026")).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(EVERYONE.length + 1);
  await expect(page.getByRole("article")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("marks the signed-in admin as Você and offers no actions on their own account", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, ADMIN_ME);
  await stubUsers(api, usersPage(EVERYONE));

  await page.goto(SCREEN_URLS.ADMIN_USERS);

  await expect(
    userEntry(page, SIGNED_IN_ADMIN).getByText(USERS_MESSAGES.YOU, { exact: true }),
  ).toBeVisible();
  await expect(actionsButton(page, SIGNED_IN_ADMIN)).toHaveCount(0);
  await expect(actionsButton(page, BRUNO)).toBeVisible();
  await expect(userEntry(page, BRUNO).getByText(USERS_MESSAGES.YOU)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("offers only the actions that /me grants on the screen", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, adminMeWithUserActions(["UPDATE"]));
  await stubUsers(api, usersPage(EVERYONE));
  await page.goto(SCREEN_URLS.ADMIN_USERS);

  await actionsButton(page, ANA).click();

  await expect(page.getByRole("menuitem", { name: USERS_MESSAGES.CHANGE_ROLE })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: USERS_MESSAGES.DISABLE })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("says no user was found and clears the search and filters", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, ADMIN_ME);
  await stubUsers(api, usersPage([]));
  await page.goto(SCREEN_URLS.ADMIN_USERS);
  const search: Locator = page.getByRole("searchbox", { name: USERS_MESSAGES.SEARCH });

  await search.fill("ninguém");

  const clear: Locator = page.getByRole("button", { name: USERS_MESSAGES.CLEAR_FILTERS });
  await expect(page.getByText(USERS_MESSAGES.EMPTY)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await clear.click();
  await expect(search).toHaveValue("");
  await expect(clear).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: MESSAGES.LIST.PAGINATION })).toHaveCount(0);
});

test("tells why the list could not be loaded", async ({ page, api }): Promise<void> => {
  await stubSession(api, ADMIN_ME);
  await api.respond(
    HTTP_METHODS.GET,
    USERS_PATH,
    problem(HTTP_STATUS.FORBIDDEN, "FORBIDDEN", FORBIDDEN_DETAIL),
    HTTP_STATUS.FORBIDDEN,
  );

  await page.goto(SCREEN_URLS.ADMIN_USERS);

  await expect(page.getByText(USERS_MESSAGES.LOAD_FAILED)).toBeVisible();
  await expect(page.getByText(FORBIDDEN_DETAIL)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
