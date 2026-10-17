import type { FormEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PageMeta } from "@/@types/pagination";
import type { AdminUser } from "@/@types/users";
import type { ChangeRoleValues } from "@/services/validation-schemas/change-role";
import type { USER_DIALOGS } from "./constants";
import type { UsersFilterModel } from "./filter/types";

export type UserDialog = (typeof USER_DIALOGS)[keyof typeof USER_DIALOGS];

export interface UserDialogTarget {
  dialog: UserDialog;
  user: AdminUser;
  open: boolean;
}

export interface UserRowActions {
  currentUserId: string | undefined;
  canChangeRole: boolean;
  canChangeStatus: boolean;
  changeRole: (user: AdminUser) => void;
  disable: (user: AdminUser) => void;
  enable: (user: AdminUser) => void;
}

export interface UserActionsModel {
  row: UserRowActions;
  target: UserDialogTarget | null;
  closeDialog: () => void;
  roleForm: UseFormReturn<ChangeRoleValues>;
  submitRole: (event: FormEvent<HTMLFormElement>) => void;
  confirmDisable: () => void;
  disabling: boolean;
}

export interface UsersListModel extends UsersFilterModel {
  users: readonly AdminUser[];
  pagination: PageMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadError: string | null;
}
