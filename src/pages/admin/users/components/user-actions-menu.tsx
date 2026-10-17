import type { JSX } from "react";
import type { AdminUser, UserStatus } from "@/@types/users";
import { RowActionsMenu } from "@/components/row-actions-menu";
import type { RowAction } from "@/components/row-actions-menu/types";
import { USER_STATUSES } from "@/constants/users";
import { USERS_MESSAGES } from "../constants/messages";
import type { UserRowActions } from "../types";

interface UserActionsMenuProps {
  user: AdminUser;
  actions: UserRowActions;
}

const STATUS_ITEMS: Record<UserStatus, (user: AdminUser, actions: UserRowActions) => RowAction> = {
  [USER_STATUSES.ACTIVE]: (user: AdminUser, actions: UserRowActions): RowAction => ({
    label: USERS_MESSAGES.DISABLE,
    variant: "destructive",
    select: (): void => actions.disable(user),
  }),
  [USER_STATUSES.DISABLED]: (user: AdminUser, actions: UserRowActions): RowAction => ({
    label: USERS_MESSAGES.ENABLE,
    variant: "default",
    select: (): void => actions.enable(user),
  }),
};

function itemsFor(user: AdminUser, actions: UserRowActions): RowAction[] {
  if (user.id === actions.currentUserId) {
    return [];
  }
  const roleItem: RowAction = {
    label: USERS_MESSAGES.CHANGE_ROLE,
    variant: "default",
    select: (): void => actions.changeRole(user),
  };
  return [
    ...(actions.canChangeRole ? [roleItem] : []),
    ...(actions.canChangeStatus ? [STATUS_ITEMS[user.status](user, actions)] : []),
  ];
}

export function UserActionsMenu({ user, actions }: UserActionsMenuProps): JSX.Element | null {
  return <RowActionsMenu name={user.name} items={itemsFor(user, actions)} />;
}
