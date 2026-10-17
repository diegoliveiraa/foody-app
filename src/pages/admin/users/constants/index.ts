import type { AdminUser } from "@/@types/users";
import { ALL_FILTER } from "@/constants/filters";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { USER_ROLE_LIST, USER_STATUS_LIST } from "@/constants/users";
import type { SortOrder } from "@/utils/sort-param";
import type { RoleFilter, StatusFilter } from "../filter/types";

export const USERS_FILTER_NAME: string = "usersFilter";

export const ROLE_FILTERS: readonly RoleFilter[] = [ALL_FILTER, ...USER_ROLE_LIST];

export const STATUS_FILTERS: readonly StatusFilter[] = [ALL_FILTER, ...USER_STATUS_LIST];

export const USER_COLUMNS = {
  NAME: "name",
  EMAIL: "email",
  ROLE: "role",
  STATUS: "status",
  CREATED_AT: "createdAt",
  ACTIONS: "actions",
} as const;

export const DEFAULT_USER_SORT: SortOrder = {
  property: USER_COLUMNS.NAME,
  direction: SORT_DIRECTIONS.ASC,
};

export const USER_DIALOGS = {
  ROLE: "role",
  DISABLE: "disable",
} as const;

export const NO_USERS: readonly AdminUser[] = [];

export const SKELETON_CARDS: number = 3;
