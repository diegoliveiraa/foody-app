import { useMemo, type JSX } from "react";
import type { AdminUser } from "@/@types/users";
import { DataTable } from "@/components/data-table";
import type { DataTableColumns } from "@/components/data-table/features";
import { ResponsiveList } from "@/components/responsive-list";
import { buildUserColumns } from "../columns";
import { USERS_MESSAGES } from "../constants/messages";
import type { UserRowActions, UsersListModel } from "../types";
import { UserCardList } from "./user-card-list";
import { UsersEmptyState, UsersLoadError } from "./users-empty-state";

interface UsersResultsProps {
  list: UsersListModel;
  actions: UserRowActions;
}

function userIdOf(user: AdminUser): string {
  return user.id;
}

export function UsersResults({ list, actions }: UsersResultsProps): JSX.Element {
  const columns: DataTableColumns<AdminUser> = useMemo(
    (): DataTableColumns<AdminUser> => buildUserColumns(actions),
    [actions],
  );

  if (list.loadError !== null) {
    return <UsersLoadError detail={list.loadError} />;
  }

  const emptyState: JSX.Element = (
    <UsersEmptyState hasFilters={list.hasFilters} onClearFilters={list.actions.clearFilters} />
  );

  return (
    <div aria-busy={list.refreshing} className="transition-opacity aria-busy:opacity-60">
      <ResponsiveList
        cards={
          <UserCardList
            users={list.users}
            loading={list.loading}
            emptyState={emptyState}
            actions={actions}
          />
        }
        table={
          <DataTable
            label={USERS_MESSAGES.LIST}
            columns={columns}
            data={list.users}
            getRowId={userIdOf}
            sort={list.filter.sort}
            onSortChange={list.actions.changeSort}
            loading={list.loading}
            emptyState={emptyState}
          />
        }
      />
    </div>
  );
}
