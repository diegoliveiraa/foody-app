import { describe, expect, it } from "vitest";
import type { ListUsersParams } from "@/@types/users";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { USER_ROLES, USER_STATUSES } from "@/constants/users";
import { USER_COLUMNS } from "../constants";
import { INITIAL_USERS_FILTER } from "../filter";
import { toListUsersParams } from "./to-list-params";

describe("toListUsersParams", () => {
  it("asks for the page, page size and sort, without search or filters by default", () => {
    const params: ListUsersParams = toListUsersParams(INITIAL_USERS_FILTER);

    expect(params).toStrictEqual({ page: 1, pageSize: 10, sort: ["name,asc"] });
  });

  it("sends the chosen role, status and sort", () => {
    const params: ListUsersParams = toListUsersParams({
      ...INITIAL_USERS_FILTER,
      role: USER_ROLES.STAFF,
      status: USER_STATUSES.DISABLED,
      page: 2,
      pageSize: 50,
      sort: { property: USER_COLUMNS.CREATED_AT, direction: SORT_DIRECTIONS.DESC },
    });

    expect(params).toStrictEqual({
      role: "STAFF",
      status: "DISABLED",
      page: 2,
      pageSize: 50,
      sort: ["createdAt,desc"],
    });
  });

  it("sends the applied search, not the text still being typed", () => {
    const params: ListUsersParams = toListUsersParams({
      ...INITIAL_USERS_FILTER,
      search: "ana@foody.dev and more",
      appliedSearch: "ana@foody.dev",
    });

    expect(params.search).toBe("ana@foody.dev");
  });

  it("sends no search while one is typed but not applied yet", () => {
    const params: ListUsersParams = toListUsersParams({ ...INITIAL_USERS_FILTER, search: "ana" });

    expect(params).not.toHaveProperty("search");
  });
});
