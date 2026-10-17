import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { MeUser } from "@/@types/me";
import type { AdminUser } from "@/@types/users";
import { ERROR_CODES } from "@/constants/api";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useChangeUserRoleMutation,
  useDisableUserMutation,
  useEnableUserMutation,
} from "@/services/users";
import { changeRoleSchema, type ChangeRoleValues } from "@/services/validation-schemas/change-role";
import { extractApiError, type ApiErrorInfo } from "@/utils/api-error";
import { USER_DIALOGS } from "../constants";
import { USER_ROLE_LABELS, USERS_MESSAGES } from "../constants/messages";
import type { UserActionsModel, UserDialog, UserDialogTarget, UserRowActions } from "../types";

function showActionError(error: unknown): void {
  const info: ApiErrorInfo = extractApiError(error);
  if (info.code === ERROR_CODES.RATE_LIMITED) {
    return;
  }
  toast.error(info.detail);
}

function closed(target: UserDialogTarget | null): UserDialogTarget | null {
  return target === null ? null : { ...target, open: false };
}

export function useUserActions(): UserActionsModel {
  const currentUser: MeUser | undefined = useCurrentUser();
  const canChangeRole: boolean = useCan(SCREEN_KEYS.ADMIN_USERS, SCREEN_ACTIONS.UPDATE);
  const canChangeStatus: boolean = useCan(SCREEN_KEYS.ADMIN_USERS, SCREEN_ACTIONS.DISABLE);
  const [target, setTarget] = useState<UserDialogTarget | null>(null);
  const roleForm: UseFormReturn<ChangeRoleValues> = useForm<ChangeRoleValues>({
    resolver: zodResolver(changeRoleSchema),
  });
  const [changeUserRole] = useChangeUserRoleMutation();
  const [disableUser, { isLoading: disabling }] = useDisableUserMutation();
  const [enableUser] = useEnableUserMutation();
  const resetRoleForm: UseFormReturn<ChangeRoleValues>["reset"] = roleForm.reset;

  const openDialog = useCallback((dialog: UserDialog, user: AdminUser): void => {
    setTarget({ dialog, user, open: true });
  }, []);

  const closeDialog = useCallback((): void => {
    setTarget(closed);
  }, []);

  const askForRole = useCallback(
    (user: AdminUser): void => {
      resetRoleForm({ role: user.role });
      openDialog(USER_DIALOGS.ROLE, user);
    },
    [openDialog, resetRoleForm],
  );

  const askToDisable = useCallback(
    (user: AdminUser): void => openDialog(USER_DIALOGS.DISABLE, user),
    [openDialog],
  );

  const enable = useCallback(
    (user: AdminUser): void => {
      enableUser(user.id)
        .unwrap()
        .then((): void => {
          toast.success(USERS_MESSAGES.ENABLED(user.name));
        })
        .catch(showActionError);
    },
    [enableUser],
  );

  const saveRole = async ({ role }: ChangeRoleValues): Promise<void> => {
    if (target === null) {
      return;
    }
    const { user }: UserDialogTarget = target;
    await changeUserRole({ id: user.id, role }).unwrap();
    toast.success(USERS_MESSAGES.ROLE_CHANGED(user.name, USER_ROLE_LABELS[role]));
    closeDialog();
  };

  const submitRole = (event: FormEvent<HTMLFormElement>): void => {
    roleForm.handleSubmit(saveRole)(event).catch(showActionError);
  };

  const confirmDisable = (): void => {
    if (target === null) {
      return;
    }
    const { user }: UserDialogTarget = target;
    disableUser(user.id)
      .unwrap()
      .then((): void => {
        toast.success(USERS_MESSAGES.DISABLED(user.name));
        closeDialog();
      })
      .catch(showActionError);
  };

  const row: UserRowActions = useMemo(
    (): UserRowActions => ({
      currentUserId: currentUser?.id,
      canChangeRole,
      canChangeStatus,
      changeRole: askForRole,
      disable: askToDisable,
      enable,
    }),
    [currentUser?.id, canChangeRole, canChangeStatus, askForRole, askToDisable, enable],
  );

  return { row, target, closeDialog, roleForm, submitRole, confirmDisable, disabling };
}
