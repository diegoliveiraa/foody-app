import { describe, expect, it } from "vitest";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/constants/pagination";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { USER_ROLES, USER_STATUSES } from "@/constants/users";
import { settledSearchToApply } from "@/utils/settled-search";
import { DEFAULT_USER_SORT, USER_COLUMNS } from "../constants";
import {
  filtersCleared,
  INITIAL_USERS_FILTER,
  pageChanged,
  pageSizeChanged,
  roleChanged,
  searchApplied,
  searchChanged,
  sortChanged,
  statusChanged,
  usersFilterReducer,
} from "./index";
import type { UsersFilterState } from "./types";

const ON_PAGE_THREE: UsersFilterState = { ...INITIAL_USERS_FILTER, page: 3 };

const FILTERED: UsersFilterState = {
  search: "ana",
  appliedSearch: "ana",
  role: USER_ROLES.STAFF,
  status: USER_STATUSES.DISABLED,
  page: 4,
  pageSize: 50,
  sort: { property: USER_COLUMNS.EMAIL, direction: SORT_DIRECTIONS.DESC },
};

describe("users filter", () => {
  it("starts on the first page of 10 users by name, without search or filters", () => {
    expect(INITIAL_USERS_FILTER).toEqual({
      search: EMPTY_SEARCH,
      appliedSearch: EMPTY_SEARCH,
      role: ALL_FILTER,
      status: ALL_FILTER,
      page: FIRST_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      sort: DEFAULT_USER_SORT,
    });
  });

  it("keeps the page and the applied search while a search is being typed", () => {
    const state: UsersFilterState = usersFilterReducer(ON_PAGE_THREE, searchChanged("an"));

    expect(state).toEqual({ ...ON_PAGE_THREE, search: "an" });
  });

  it("applies a settled search on the first page", () => {
    const typing: UsersFilterState = { ...ON_PAGE_THREE, search: "ana" };

    const state: UsersFilterState = usersFilterReducer(typing, searchApplied("ana"));

    expect(state).toEqual({ ...typing, appliedSearch: "ana", page: FIRST_PAGE });
  });

  it("goes back to the first page when the role filter changes", () => {
    const state: UsersFilterState = usersFilterReducer(
      ON_PAGE_THREE,
      roleChanged(USER_ROLES.ADMIN),
    );

    expect(state).toEqual({ ...INITIAL_USERS_FILTER, role: USER_ROLES.ADMIN });
  });

  it("goes back to the first page when the status filter changes", () => {
    const state: UsersFilterState = usersFilterReducer(
      ON_PAGE_THREE,
      statusChanged(USER_STATUSES.ACTIVE),
    );

    expect(state).toEqual({ ...INITIAL_USERS_FILTER, status: USER_STATUSES.ACTIVE });
  });

  it("goes back to the first page when the page size changes", () => {
    const state: UsersFilterState = usersFilterReducer(ON_PAGE_THREE, pageSizeChanged(25));

    expect(state).toEqual({ ...INITIAL_USERS_FILTER, pageSize: 25 });
  });

  it("goes back to the first page when the sort changes, keeping the search and filters", () => {
    const byNewest: UsersFilterState["sort"] = {
      property: USER_COLUMNS.CREATED_AT,
      direction: SORT_DIRECTIONS.DESC,
    };

    const state: UsersFilterState = usersFilterReducer(FILTERED, sortChanged(byNewest));

    expect(state).toEqual({ ...FILTERED, sort: byNewest, page: FIRST_PAGE });
  });

  it("moves to another page keeping the search, filters and sort", () => {
    const state: UsersFilterState = usersFilterReducer(FILTERED, pageChanged(5));

    expect(state).toEqual({ ...FILTERED, page: 5 });
  });

  it("clears the search and filters, back on the first page, keeping page size and sort", () => {
    const state: UsersFilterState = usersFilterReducer(FILTERED, filtersCleared());

    expect(state).toEqual({
      ...INITIAL_USERS_FILTER,
      pageSize: FILTERED.pageSize,
      sort: FILTERED.sort,
    });
  });
});

describe("settledSearchToApply on the users filter", () => {
  it("applies nothing right after the filters were cleared, while the old value settles", () => {
    const cleared: UsersFilterState = usersFilterReducer(FILTERED, filtersCleared());

    const search: string | null = settledSearchToApply(cleared, "ana");

    expect(search).toBeNull();
  });
});
