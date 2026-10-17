import type { JSX } from "react";
import type { FormState } from "react-hook-form";
import { FormAlert } from "@/components/form-alert";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CategoryFormInput } from "@/services/validation-schemas/category";
import { CATEGORIES_MESSAGES } from "../constants/messages";
import type { CategoryFormModel } from "../types";

interface CategoryFormDialogProps {
  model: CategoryFormModel;
}

export function CategoryFormDialog({ model }: CategoryFormDialogProps): JSX.Element {
  const { form } = model;
  const { errors, isSubmitting }: FormState<CategoryFormInput> = form.formState;
  const editing: boolean = model.editing !== null;

  return (
    <Dialog
      open={model.open}
      onOpenChange={(next: boolean): void => {
        if (!next) {
          model.close();
        }
      }}
    >
      <DialogContent>
        <form noValidate onSubmit={model.submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>
              {model.editing === null
                ? CATEGORIES_MESSAGES.FORM.CREATE_TITLE
                : CATEGORIES_MESSAGES.FORM.EDIT_TITLE(model.editing.name)}
            </DialogTitle>
            <DialogDescription>{CATEGORIES_MESSAGES.FORM.DESCRIPTION}</DialogDescription>
          </DialogHeader>
          <FormAlert message={errors.root?.message} />
          <FormField
            label={CATEGORIES_MESSAGES.FORM.NAME}
            autoComplete="off"
            error={errors.name?.message}
            {...form.register("name")}
          />
          <FormField
            label={CATEGORIES_MESSAGES.FORM.DISPLAY_ORDER}
            inputMode="numeric"
            autoComplete="off"
            error={errors.displayOrder?.message}
            {...form.register("displayOrder")}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={model.close}>
              {CATEGORIES_MESSAGES.FORM.CANCEL}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? CATEGORIES_MESSAGES.FORM.SAVE : CATEGORIES_MESSAGES.FORM.CREATE}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
