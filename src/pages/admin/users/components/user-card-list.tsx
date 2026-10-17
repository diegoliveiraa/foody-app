import type { JSX, ReactNode } from "react";
import type { AdminUser } from "@/@types/users";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/format-date";
import { SKELETON_CARDS } from "../constants";
import { USERS_MESSAGES } from "../constants/messages";
import type { UserRowActions } from "../types";
import { UserActionsMenu } from "./user-actions-menu";
import { UserName, UserRoleBadge, UserStatusBadge } from "./user-badges";

interface UserCardProps {
  user: AdminUser;
  actions: UserRowActions;
}

interface UserCardListProps {
  users: readonly AdminUser[];
  loading: boolean;
  emptyState: ReactNode;
  actions: UserRowActions;
}

function UserCard({ user, actions }: UserCardProps): JSX.Element {
  return (
    <article
      aria-label={user.name}
      className="flex flex-col gap-2.5 rounded-2xl border bg-card p-4 shadow-xs"
    >
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <UserName user={user} currentUserId={actions.currentUserId} />
          <span className="truncate text-sm text-muted-foreground">{user.email}</span>
        </div>
        <div className="-mt-2 -mr-2 shrink-0">
          <UserActionsMenu user={user} actions={actions} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <UserRoleBadge role={user.role} />
        <UserStatusBadge status={user.status} />
      </div>
      <span className="text-[13px] text-muted-foreground">
        {USERS_MESSAGES.CREATED_AT(formatDate(user.createdAt))}
      </span>
    </article>
  );
}

function SkeletonCards(): JSX.Element {
  return (
    <div aria-busy="true" aria-label={USERS_MESSAGES.LIST} className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_CARDS }, (_card: unknown, index: number): JSX.Element => (
        <div key={index} className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
          <Skeleton className="h-6 w-32" />
        </div>
      ))}
    </div>
  );
}

export function UserCardList({
  users,
  loading,
  emptyState,
  actions,
}: UserCardListProps): JSX.Element {
  if (loading) {
    return <SkeletonCards />;
  }
  if (users.length === 0) {
    return <>{emptyState}</>;
  }
  return (
    <ul aria-label={USERS_MESSAGES.LIST} className="flex flex-col gap-3">
      {users.map((user: AdminUser): JSX.Element => (
        <li key={user.id}>
          <UserCard user={user} actions={actions} />
        </li>
      ))}
    </ul>
  );
}
