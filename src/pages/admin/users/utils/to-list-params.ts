import type { ListUsersParams } from "@/@types/users";
import { toSortParam } from "@/utils/sort-param";
import { ALL_FILTER, EMPTY_SEARCH } from "../constants";
import type { UsersFilterState } from "../filter/types";

export function toListUsersParams({
  appliedSearch,
  role,
  status,
  page,
  pageSize,
  sort,
}: UsersFilterState): ListUsersParams {
  const search: string = appliedSearch.trim();
  return {
    ...(search === EMPTY_SEARCH ? {} : { search }),
    ...(role === ALL_FILTER ? {} : { role }),
    ...(status === ALL_FILTER ? {} : { status }),
    page,
    pageSize,
    sort: [toSortParam(sort)],
  };
}
