import { cn } from "cn";
import type { JSX } from "react";
import { FormAlert } from "@/components/form-alert";
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
import { MESSAGES } from "@/constants/messages";

interface ConfirmDialogAlternative {
  label: string;
  onSelect: () => void;
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
  conflict?: string;
  alternative?: ConfirmDialogAlternative;
}

const WIDE_DIALOG_CLASS: string = "data-[size=default]:sm:max-w-md";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
  onClose,
  conflict,
  alternative,
}: ConfirmDialogProps): JSX.Element {
  const confirmable: boolean = conflict === undefined;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next: boolean): void => {
        if (!next) {
          onClose();
        }
      }}
    >
      <AlertDialogContent
        className={cn("grid-cols-[minmax(0,1fr)]", alternative && WIDE_DIALOG_CLASS)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <FormAlert message={conflict} />
        <AlertDialogFooter className="sm:flex-wrap">
          <AlertDialogCancel>{MESSAGES.ACTIONS.CANCEL}</AlertDialogCancel>
          {alternative && (
            <Button disabled={pending} onClick={alternative.onSelect}>
              {alternative.label}
            </Button>
          )}
          {confirmable && (
            <Button variant="destructive" disabled={pending} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
