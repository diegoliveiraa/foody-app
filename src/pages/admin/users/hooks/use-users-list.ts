import { useMemo } from "react";
import type { AdminUser, ListUsersParams } from "@/@types/users";
import { useListUsersQuery } from "@/services/users";
import { extractApiError } from "@/utils/api-error";
import { NO_USERS } from "../constants";
import { useUsersFilter } from "../filter/hooks/use-users-filter";
import type { UsersFilterModel } from "../filter/types";
import type { UsersListModel } from "../types";
import { toListUsersParams } from "../utils/to-list-params";

export function useUsersList(): UsersListModel {
  const { filter, actions, hasFilters }: UsersFilterModel = useUsersFilter();
  const params: ListUsersParams = useMemo(
    (): ListUsersParams => toListUsersParams(filter),
    [filter],
  );
  const { data, error, isLoading, isFetching } = useListUsersQuery(params);
  const users: readonly AdminUser[] = data?.data ?? NO_USERS;
  const loadError: string | null = useMemo(
    (): string | null => (error === undefined ? null : extractApiError(error).detail),
    [error],
  );

  return {
    filter,
    actions,
    hasFilters,
    users,
    pagination: loadError === null && data !== undefined && users.length > 0 ? data.meta : null,
    loading: isLoading,
    refreshing: isFetching && !isLoading,
    loadError,
  };
}
