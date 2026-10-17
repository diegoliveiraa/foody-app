import type { FetchArgs, TagDescription } from "@reduxjs/toolkit/query";
import type { AdminUser, AdminUserPage, ChangeUserRoleArgs, ListUsersParams } from "@/@types/users";
import { ADMIN_USER_PATHS, API_PATHS, HTTP_METHODS } from "@/constants/api";
import { api } from "./api";
import { CACHE_TAGS, LIST_ID, type CacheTag } from "./cache-tags";

type UserTag = TagDescription<CacheTag>;

const USER_LIST_TAG: UserTag = { type: CACHE_TAGS.USER, id: LIST_ID };

function userTags(id: AdminUser["id"]): UserTag[] {
  return [{ type: CACHE_TAGS.USER, id }, USER_LIST_TAG];
}

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<AdminUserPage, ListUsersParams>({
      query: (params: ListUsersParams): FetchArgs => ({ url: API_PATHS.ADMIN_USERS, params }),
      providesTags: (page: AdminUserPage | undefined): UserTag[] => [
        USER_LIST_TAG,
        ...(page?.data ?? []).map((user: AdminUser): UserTag => ({
          type: CACHE_TAGS.USER,
          id: user.id,
        })),
      ],
    }),
    changeUserRole: build.mutation<AdminUser, ChangeUserRoleArgs>({
      query: ({ id, role }: ChangeUserRoleArgs): FetchArgs => ({
        url: ADMIN_USER_PATHS.ROLE(id),
        method: HTTP_METHODS.PATCH,
        body: { role },
      }),
      invalidatesTags: (_user, _error, { id }: ChangeUserRoleArgs): UserTag[] => userTags(id),
    }),
    disableUser: build.mutation<AdminUser, AdminUser["id"]>({
      query: (id: AdminUser["id"]): FetchArgs => ({
        url: ADMIN_USER_PATHS.DISABLE(id),
        method: HTTP_METHODS.POST,
      }),
      invalidatesTags: (_user, _error, id: AdminUser["id"]): UserTag[] => userTags(id),
    }),
    enableUser: build.mutation<AdminUser, AdminUser["id"]>({
      query: (id: AdminUser["id"]): FetchArgs => ({
        url: ADMIN_USER_PATHS.ENABLE(id),
        method: HTTP_METHODS.POST,
      }),
      invalidatesTags: (_user, _error, id: AdminUser["id"]): UserTag[] => userTags(id),
    }),
  }),
});

export const {
  useListUsersQuery,
  useChangeUserRoleMutation,
  useDisableUserMutation,
  useEnableUserMutation,
} = usersApi;
