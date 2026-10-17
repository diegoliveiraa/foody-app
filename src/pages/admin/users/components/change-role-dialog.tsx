import { useId, type FormEvent, type JSX } from "react";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FormState,
  type UseFormReturn,
} from "react-hook-form";
import type { UserRole } from "@/@types/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLE_LIST } from "@/constants/users";
import type { ChangeRoleValues } from "@/services/validation-schemas/change-role";
import { USER_DIALOGS } from "../constants";
import { USER_ROLE_LABELS, USERS_MESSAGES } from "../constants/messages";
import type { UserDialogTarget } from "../types";

interface ChangeRoleDialogProps {
  target: UserDialogTarget | null;
  form: UseFormReturn<ChangeRoleValues>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

interface RoleFieldProps {
  field: ControllerRenderProps<ChangeRoleValues, "role">;
  fieldState: ControllerFieldState;
}

function RoleField({ field, fieldState }: RoleFieldProps): JSX.Element {
  const id: string = useId();
  const errorId: string = `${id}-error`;
  const invalid: boolean = fieldState.error !== undefined;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{USERS_MESSAGES.ROLE_DIALOG.ROLE}</FieldLabel>
      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
        <SelectTrigger
          id={id}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className="w-full"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {USER_ROLE_LIST.map((role: UserRole): JSX.Element => (
            <SelectItem key={role} value={role}>
              {USER_ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError id={errorId}>{fieldState.error?.message}</FieldError>
    </Field>
  );
}

export function ChangeRoleDialog({
  target,
  form,
  onSubmit,
  onClose,
}: ChangeRoleDialogProps): JSX.Element {
  const open: boolean = target?.dialog === USER_DIALOGS.ROLE && target.open;
  const { isDirty, isSubmitting }: FormState<ChangeRoleValues> = form.formState;

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean): void => {
        if (!next) {
          onClose();
        }
      }}
    >
      {target && (
        <DialogContent>
          <form noValidate onSubmit={onSubmit} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>{USERS_MESSAGES.ROLE_DIALOG.TITLE(target.user.name)}</DialogTitle>
              <DialogDescription>{target.user.email}</DialogDescription>
            </DialogHeader>
            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }): JSX.Element => (
                <RoleField field={field} fieldState={fieldState} />
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {USERS_MESSAGES.CANCEL}
              </Button>
              <Button type="submit" disabled={!isDirty || isSubmitting}>
                {USERS_MESSAGES.ROLE_DIALOG.SAVE}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
