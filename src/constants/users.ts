import type { UserRole, UserStatus } from "@/@types/users";

export const USER_ROLES = {
  CUSTOMER: "CUSTOMER",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
} as const satisfies Record<UserRole, UserRole>;

export const USER_STATUSES = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const satisfies Record<UserStatus, UserStatus>;

export const USER_ROLE_LIST: readonly UserRole[] = Object.values(USER_ROLES);

export const USER_STATUS_LIST: readonly UserStatus[] = Object.values(USER_STATUSES);
