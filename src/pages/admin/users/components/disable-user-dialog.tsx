import type { JSX } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next: boolean): void => {
        if (!next) {
          onClose();
        }
      }}
    >
      {target && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {USERS_MESSAGES.DISABLE_DIALOG.TITLE(target.user.name)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {USERS_MESSAGES.DISABLE_DIALOG.DESCRIPTION(target.user.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{USERS_MESSAGES.CANCEL}</AlertDialogCancel>
            <Button variant="destructive" disabled={pending} onClick={onConfirm}>
              {USERS_MESSAGES.DISABLE_DIALOG.CONFIRM}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
