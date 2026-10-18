import type { Page } from "@playwright/test";
import { MESSAGES } from "../../../src/constants/messages";
import { USERS_MESSAGES } from "../../../src/pages/admin/users/constants/messages";
import { SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow, showsListCards } from "../../support/layout";
import { ADMIN_ME } from "../../support/me";
import { chooseOption, sortOptionLabels, sortSelect } from "../../support/select";
import { stubSession } from "../../support/session";
import { ANA, EVERYONE, sentQueries, stubUsers, userEntry, usersPage } from "../../support/users";

const DEFAULT_QUERY: Record<string, string> = { page: "1", pageSize: "10", sort: "name,asc" };

async function openUsers(page: Page, api: ApiStubs): Promise<void> {
  await stubSession(api, ADMIN_ME);
  await stubUsers(api, usersPage(EVERYONE, { totalItems: 25, totalPages: 3, hasNext: true }));
  await page.goto(SCREEN_URLS.ADMIN_USERS);
  await expect(userEntry(page, ANA)).toBeVisible();
}

test("offers the users' sorts in plain words above the cards, starting by name", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await openUsers(page, api);

  await expect(sortSelect(page)).toHaveText(USERS_MESSAGES.SORT_OPTIONS.NAME_ASC);
  expect(await sortOptionLabels(page)).toEqual([
    "Nome (A–Z)",
    "Nome (Z–A)",
    "E-mail (A–Z)",
    "Mais recentes",
  ]);
  await expectNoHorizontalOverflow(page);
});

test("sorts the user cards by the chosen option, back on the first page", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await openUsers(page, api);
  await page.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE }).click();
  await expect
    .poll((): Record<string, string>[] => sentQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, page: "2" });

  await chooseOption(page, sortSelect(page), USERS_MESSAGES.SORT_OPTIONS.EMAIL_ASC);

  await expect(sortSelect(page)).toHaveText(USERS_MESSAGES.SORT_OPTIONS.EMAIL_ASC);
  await expect
    .poll((): Record<string, string>[] => sentQueries(api))
    .toEqual([
      DEFAULT_QUERY,
      { ...DEFAULT_QUERY, page: "2" },
      { ...DEFAULT_QUERY, sort: "email,asc" },
    ]);
  await expectNoHorizontalOverflow(page);
});

test("leaves sorting the users to the column headers next to the table", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await openUsers(page, api);

  await expect(sortSelect(page)).toHaveCount(0);
});
