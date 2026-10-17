import { createColumnHelper, type CellContext, type ColumnHelper } from "@tanstack/react-table";
import type { JSX } from "react";
import type { AdminUser, UserRole, UserStatus } from "@/@types/users";
import type { DataTableColumns, DataTableFeatures } from "@/components/data-table/features";
import { MESSAGES } from "@/constants/messages";
import { formatDate } from "@/utils/format-date";
import { UserActionsMenu } from "./components/user-actions-menu";
import { UserName, UserRoleBadge, UserStatusBadge } from "./components/user-badges";
import { USER_COLUMNS } from "./constants";
import { USERS_MESSAGES } from "./constants/messages";
import type { UserRowActions } from "./types";

type UserCell<TValue> = CellContext<DataTableFeatures, AdminUser, TValue>;

const column: ColumnHelper<DataTableFeatures, AdminUser> = createColumnHelper<
  DataTableFeatures,
  AdminUser
>();

export function buildUserColumns(actions: UserRowActions): DataTableColumns<AdminUser> {
  return column.columns([
    column.accessor(USER_COLUMNS.NAME, {
      header: MESSAGES.FIELDS.NAME,
      cell: ({ row }: UserCell<string>): JSX.Element => (
        <UserName user={row.original} currentUserId={actions.currentUserId} />
      ),
    }),
    column.accessor(USER_COLUMNS.EMAIL, {
      header: MESSAGES.FIELDS.EMAIL,
      cell: ({ getValue }: UserCell<string>): JSX.Element => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
    }),
    column.accessor(USER_COLUMNS.ROLE, {
      header: USERS_MESSAGES.COLUMNS.ROLE,
      enableSorting: false,
      cell: ({ getValue }: UserCell<UserRole>): JSX.Element => <UserRoleBadge role={getValue()} />,
    }),
    column.accessor(USER_COLUMNS.STATUS, {
      header: USERS_MESSAGES.COLUMNS.STATUS,
      enableSorting: false,
      cell: ({ getValue }: UserCell<UserStatus>): JSX.Element => (
        <UserStatusBadge status={getValue()} />
      ),
    }),
    column.accessor(USER_COLUMNS.CREATED_AT, {
      header: USERS_MESSAGES.COLUMNS.CREATED_AT,
      cell: ({ getValue }: UserCell<string>): string => formatDate(getValue()),
    }),
    column.display({
      id: USER_COLUMNS.ACTIONS,
      header: (): JSX.Element => <span className="sr-only">{USERS_MESSAGES.COLUMNS.ACTIONS}</span>,
      cell: ({ row }: UserCell<unknown>): JSX.Element => (
        <div className="-my-1 flex justify-end">
          <UserActionsMenu user={row.original} actions={actions} />
        </div>
      ),
    }),
  ]);
}
