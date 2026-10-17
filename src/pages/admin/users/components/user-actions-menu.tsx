import { MoreHorizontal } from "lucide-react";
import type { ComponentProps, JSX } from "react";
import type { AdminUser, UserStatus } from "@/@types/users";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_STATUSES } from "@/constants/users";
import { USERS_MESSAGES } from "../constants/messages";
import type { UserRowActions } from "../types";

type ItemVariant = ComponentProps<typeof DropdownMenuItem>["variant"];

interface MenuItem {
  label: string;
  variant: ItemVariant;
  select: () => void;
}

interface UserActionsMenuProps {
  user: AdminUser;
  actions: UserRowActions;
}

const STATUS_ITEMS: Record<UserStatus, (user: AdminUser, actions: UserRowActions) => MenuItem> = {
  [USER_STATUSES.ACTIVE]: (user: AdminUser, actions: UserRowActions): MenuItem => ({
    label: USERS_MESSAGES.DISABLE,
    variant: "destructive",
    select: (): void => actions.disable(user),
  }),
  [USER_STATUSES.DISABLED]: (user: AdminUser, actions: UserRowActions): MenuItem => ({
    label: USERS_MESSAGES.ENABLE,
    variant: "default",
    select: (): void => actions.enable(user),
  }),
};

function itemsFor(user: AdminUser, actions: UserRowActions): MenuItem[] {
  if (user.id === actions.currentUserId) {
    return [];
  }
  const roleItem: MenuItem = {
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
  const items: MenuItem[] = itemsFor(user, actions);
  if (items.length === 0) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={USERS_MESSAGES.ACTIONS_FOR(user.name)}>
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map((item: MenuItem): JSX.Element => (
          <DropdownMenuItem key={item.label} variant={item.variant} onSelect={item.select}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
