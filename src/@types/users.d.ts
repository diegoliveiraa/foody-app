import type { components, operations } from "./api";

export type AdminUser = components["schemas"]["AdminUserResponse"];

export type AdminUserPage = components["schemas"]["PageResponseAdminUserResponse"];

export type UserRole = AdminUser["role"];

export type UserStatus = AdminUser["status"];

export type ChangeRoleRequest = components["schemas"]["ChangeRoleRequest"];

export type UserPath = operations["adminUserChangeRole"]["parameters"]["path"];

export type ChangeUserRoleArgs = UserPath & ChangeRoleRequest;

export type ListUsersParams = NonNullable<operations["adminUserList"]["parameters"]["query"]>;
