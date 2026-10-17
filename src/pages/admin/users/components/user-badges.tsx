import type { VariantProps } from "class-variance-authority";
import type { JSX } from "react";
import type { AdminUser, UserRole, UserStatus } from "@/@types/users";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import type { badgeVariants } from "@/components/ui/badge-variants";
import { USER_ROLES } from "@/constants/users";
import { USER_ROLE_LABELS, USER_STATUS_LABELS, USERS_MESSAGES } from "../constants/messages";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const ROLE_VARIANTS: Record<UserRole, BadgeVariant> = {
  [USER_ROLES.CUSTOMER]: "outline",
  [USER_ROLES.STAFF]: "secondary",
  [USER_ROLES.ADMIN]: "default",
};

export function UserRoleBadge({ role }: { role: UserRole }): JSX.Element {
  return <Badge variant={ROLE_VARIANTS[role]}>{USER_ROLE_LABELS[role]}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }): JSX.Element {
  return <StatusBadge status={status} label={USER_STATUS_LABELS[status]} />;
}

interface UserNameProps {
  user: AdminUser;
  currentUserId: string | undefined;
}

export function UserName({ user, currentUserId }: UserNameProps): JSX.Element {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <span className="truncate font-semibold text-foreground">{user.name}</span>
      {user.id === currentUserId && <Badge variant="secondary">{USERS_MESSAGES.YOU}</Badge>}
    </span>
  );
}
