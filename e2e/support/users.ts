import { expect, type Locator, type Page } from "@playwright/test";
import type { PageMeta } from "../../src/@types/pagination";
import type { AdminUser, AdminUserPage } from "../../src/@types/users";
import { API_PATHS } from "../../src/constants/api";
import { USERS_MESSAGES } from "../../src/pages/admin/users/constants/messages";
import { HTTP_METHODS, SCREEN_URLS } from "./constants";
import type { ApiStubs, RecordedRequest } from "./fixtures";
import { showsListCards } from "./layout";
import { ADMIN_ME } from "./me";
import { stubSession } from "./session";

export type UserIdentity = Pick<AdminUser, "name" | "email">;

export const USERS_PATH: string = API_PATHS.ADMIN_USERS;

const FIRST_PAGE_META: PageMeta = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

export const SIGNED_IN_ADMIN: AdminUser = {
  ...ADMIN_ME.user,
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: "2025-11-20T15:00:00Z",
  disabledAt: null,
};

export const ANA: AdminUser = {
  id: "0199f2a0-0000-7000-8000-00000000000a",
  name: "Ana Souza",
  email: "ana@foody.dev",
  role: "CUSTOMER",
  status: "ACTIVE",
  createdAt: "2026-03-04T15:00:00Z",
  disabledAt: null,
};

export const BRUNO: AdminUser = {
  id: "0199f2a0-0000-7000-8000-00000000000b",
  name: "Bruno Lima",
  email: "bruno@foody.dev",
  role: "STAFF",
  status: "ACTIVE",
  createdAt: "2026-02-10T15:00:00Z",
  disabledAt: null,
};

export const ELISA: AdminUser = {
  id: "0199f2a0-0000-7000-8000-00000000000e",
  name: "Elisa Rocha",
  email: "elisa@foody.dev",
  role: "CUSTOMER",
  status: "DISABLED",
  createdAt: "2026-01-15T15:00:00Z",
  disabledAt: "2026-04-01T15:00:00Z",
};

export const GABRIEL: AdminUser = {
  id: "0199f2a0-0000-7000-8000-00000000000f",
  name: "Gabriel Torres",
  email: "gabriel@foody.dev",
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: "2025-12-01T15:00:00Z",
  disabledAt: null,
};

export const EVERYONE: readonly AdminUser[] = [ANA, BRUNO, SIGNED_IN_ADMIN, ELISA, GABRIEL];

export function usersPage(
  users: readonly AdminUser[],
  meta: Partial<PageMeta> = {},
): AdminUserPage {
  return {
    data: [...users],
    meta: { ...FIRST_PAGE_META, totalItems: users.length, ...meta },
  };
}

export async function stubUsers(api: ApiStubs, page: AdminUserPage): Promise<void> {
  await api.respond(HTTP_METHODS.GET, USERS_PATH, page);
}

export async function stubUsersWith(api: ApiStubs, changed: AdminUser): Promise<void> {
  await stubUsers(
    api,
    usersPage(
      EVERYONE.map((user: AdminUser): AdminUser => (user.id === changed.id ? changed : user)),
    ),
  );
}

export function listQueries(api: ApiStubs): URLSearchParams[] {
  return api
    .requests(HTTP_METHODS.GET, USERS_PATH)
    .map((request: RecordedRequest): URLSearchParams => request.url.searchParams);
}

export function sentQueries(api: ApiStubs): Record<string, string>[] {
  return listQueries(api).map((query: URLSearchParams): Record<string, string> =>
    Object.fromEntries(query),
  );
}

export function userEntry(page: Page, user: UserIdentity): Locator {
  if (showsListCards(page)) {
    return page.getByRole("article", { name: user.name });
  }
  return page.getByRole("row").filter({ hasText: user.email });
}

export function actionsButton(page: Page, user: UserIdentity): Locator {
  return userEntry(page, user).getByRole("button", { name: USERS_MESSAGES.ACTIONS_FOR(user.name) });
}

export async function openUsersScreen(page: Page, api: ApiStubs): Promise<void> {
  await stubSession(api, ADMIN_ME);
  await stubUsers(api, usersPage(EVERYONE));
  await page.goto(SCREEN_URLS.ADMIN_USERS);
  await expect(userEntry(page, ANA)).toBeVisible();
}

export async function chooseUserAction(
  page: Page,
  user: UserIdentity,
  action: string,
): Promise<void> {
  await actionsButton(page, user).click();
  await page.getByRole("menuitem", { name: action }).click();
}
