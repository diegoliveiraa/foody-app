import type { JSX } from "react";
import type { MeScreen } from "@/@types/me";
import { ListPagination } from "@/components/list-pagination";
import { PageHeader } from "@/components/page-header";
import { SCREEN_KEYS } from "@/constants/screens";
import { useMeScreen } from "@/hooks/use-me-screen";
import { ChangeRoleDialog } from "./components/change-role-dialog";
import { DisableUserDialog } from "./components/disable-user-dialog";
import { UsersResults } from "./components/users-results";
import { UsersToolbar } from "./components/users-toolbar";
import { useUserActions } from "./hooks/use-user-actions";
import { useUsersList } from "./hooks/use-users-list";
import type { UserActionsModel, UsersListModel } from "./types";

export function UsersScreen(): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.ADMIN_USERS);
  const list: UsersListModel = useUsersList();
  const actions: UserActionsModel = useUserActions();

  return (
    <>
      <PageHeader title={screen?.label} />
      <section className="flex flex-1 flex-col gap-4 px-4 pb-8 md:px-8">
        <UsersToolbar filter={list.filter} actions={list.actions} />
        <UsersResults list={list} actions={actions.row} />
        {list.pagination && (
          <ListPagination
            meta={list.pagination}
            onPageChange={list.actions.changePage}
            onPageSizeChange={list.actions.changePageSize}
          />
        )}
      </section>
      <ChangeRoleDialog
        target={actions.target}
        form={actions.roleForm}
        onSubmit={actions.submitRole}
        onClose={actions.closeDialog}
      />
      <DisableUserDialog
        target={actions.target}
        pending={actions.disabling}
        onConfirm={actions.confirmDisable}
        onClose={actions.closeDialog}
      />
    </>
  );
}
