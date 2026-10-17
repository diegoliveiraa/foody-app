import type { JSX } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EMPTY_TEXT } from "@/constants/validation";
import { USER_DIALOGS } from "../constants";
import { USERS_MESSAGES } from "../constants/messages";
import type { UserDialogTarget } from "../types";

interface DisableUserDialogProps {
  target: UserDialogTarget | null;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DisableUserDialog({
  target,
  pending,
  onConfirm,
  onClose,
}: DisableUserDialogProps): JSX.Element {
  const open: boolean = target?.dialog === USER_DIALOGS.DISABLE && target.open;
  const name: string = target?.user.name ?? EMPTY_TEXT;

  return (
    <ConfirmDialog
      open={open}
      title={USERS_MESSAGES.DISABLE_DIALOG.TITLE(name)}
      description={USERS_MESSAGES.DISABLE_DIALOG.DESCRIPTION(name)}
      confirmLabel={USERS_MESSAGES.DISABLE_DIALOG.CONFIRM}
      pending={pending}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
