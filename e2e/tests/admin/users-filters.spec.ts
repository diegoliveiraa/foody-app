import type { Locator, Page } from "@playwright/test";
import { MESSAGES } from "../../../src/constants/messages";
import {
  ROLE_FILTER_LABELS,
  STATUS_FILTER_LABELS,
  USERS_MESSAGES,
} from "../../../src/pages/admin/users/constants/messages";
import { SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow, showsListCards } from "../../support/layout";
import { ADMIN_ME } from "../../support/me";
import { stubSession } from "../../support/session";
import { chooseOption } from "../../support/select";
import { EVERYONE, sentQueries, stubUsers, usersPage } from "../../support/users";

const MANY_PAGES: number = 3;

const DEFAULT_QUERY: Record<string, string> = { page: "1", pageSize: "10", sort: "name,asc" };

async function openUsersOnManyPages(page: Page, api: ApiStubs): Promise<void> {
  await stubSession(api, ADMIN_ME);
  await stubUsers(
    api,
    usersPage(EVERYONE, { totalItems: 25, totalPages: MANY_PAGES, hasNext: true }),
  );
  await page.goto(SCREEN_URLS.ADMIN_USERS);
}

async function goToSecondPage(page: Page, api: ApiStubs): Promise<void> {
  await page.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE }).click();
  await expect
    .poll((): Record<string, string>[] => sentQueries(api))
    .toContainEqual({
      ...DEFAULT_QUERY,
      page: "2",
    });
}

function searchBox(page: Page): Locator {
  return page.getByRole("searchbox", { name: USERS_MESSAGES.SEARCH });
}

test("first asks for page 1 of 10 users by name, without search or filters", async ({
  page,
  api,
}): Promise<void> => {
  await openUsersOnManyPages(page, api);

  await expect(searchBox(page)).toHaveAttribute("placeholder", USERS_MESSAGES.SEARCH);
  await expect.poll((): Record<string, string>[] => sentQueries(api)).toEqual([DEFAULT_QUERY]);
  await expectNoHorizontalOverflow(page);
});

test("searches on the first page once the typing settles, without re-asking for the old search", async ({
  page,
  api,
}): Promise<void> => {
  await openUsersOnManyPages(page, api);
  await goToSecondPage(page, api);

  await searchBox(page).pressSequentially("ana");

  await expect
    .poll((): Record<string, string>[] => sentQueries(api))
    .toEqual([DEFAULT_QUERY, { ...DEFAULT_QUERY, page: "2" }, { ...DEFAULT_QUERY, search: "ana" }]);
  await expectNoHorizontalOverflow(page);
});

test("filters by role and by status, going back to the first page", async ({
  page,
  api,
}): Promise<void> => {
  await openUsersOnManyPages(page, api);
  await goToSecondPage(page, api);

  await chooseOption(
    page,
    page.getByRole("combobox", { name: USERS_MESSAGES.ROLE_FILTER }),
    ROLE_FILTER_LABELS.STAFF,
  );
  await chooseOption(
    page,
    page.getByRole("combobox", { name: USERS_MESSAGES.STATUS_FILTER }),
    STATUS_FILTER_LABELS.DISABLED,
  );

  await expect
    .poll((): Record<string, string>[] => sentQueries(api))
    .toContainEqual({
      ...DEFAULT_QUERY,
      role: "STAFF",
      status: "DISABLED",
    });
  await expect(page.getByRole("combobox", { name: USERS_MESSAGES.ROLE_FILTER })).toHaveText(
    ROLE_FILTER_LABELS.STAFF,
  );
  await expectNoHorizontalOverflow(page);
});

test("sorts by a column header back on the first page, flipping the order on a second click", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await openUsersOnManyPages(page, api);
  await goToSecondPage(page, api);
  const emailHeader: Locator = page.getByRole("columnheader", { name: MESSAGES.FIELDS.EMAIL });

  await emailHeader.getByRole("button").click();
  await expect(emailHeader).toHaveAttribute("aria-sort", "ascending");
  await emailHeader.getByRole("button").click();

  await expect(emailHeader).toHaveAttribute("aria-sort", "descending");
  await expect
    .poll((): Record<string, string>[] => sentQueries(api))
    .toEqual([
      DEFAULT_QUERY,
      { ...DEFAULT_QUERY, page: "2" },
      { ...DEFAULT_QUERY, sort: "email,asc" },
      { ...DEFAULT_QUERY, sort: "email,desc" },
    ]);
  await expectNoHorizontalOverflow(page);
});

test("moves between pages and changes the page size back on the first page", async ({
  page,
  api,
}): Promise<void> => {
  await openUsersOnManyPages(page, api);
  await goToSecondPage(page, api);

  await chooseOption(page, page.getByRole("combobox", { name: MESSAGES.LIST.PAGE_SIZE }), "25");

  await expect
    .poll((): Record<string, string>[] => sentQueries(api))
    .toContainEqual({
      ...DEFAULT_QUERY,
      pageSize: "25",
    });
  await expectNoHorizontalOverflow(page);
});
