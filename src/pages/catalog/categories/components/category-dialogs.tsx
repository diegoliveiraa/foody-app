import type { JSX } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { CATALOG_STATUSES } from "@/constants/catalog";
import { EMPTY_TEXT } from "@/constants/validation";
import { CATEGORY_DIALOGS, NO_PRODUCT } from "../constants";
import { CATEGORIES_MESSAGES } from "../constants/messages";
import type { CategoryActionsModel, CategoryDialog } from "../types";
import { disableDescriptionOf } from "../utils/disable-description";

interface CategoryDialogsProps {
  actions: CategoryActionsModel;
}

function isOpen(actions: CategoryActionsModel, dialog: CategoryDialog): boolean {
  return actions.target?.dialog === dialog && actions.target.open;
}

export function CategoryDialogs({ actions }: CategoryDialogsProps): JSX.Element {
  const name: string = actions.target?.category.name ?? EMPTY_TEXT;
  const productCount: number = actions.target?.category.productCount ?? NO_PRODUCT;
  const offersDisable: boolean =
    actions.target?.error !== undefined &&
    actions.target.category.status === CATALOG_STATUSES.ACTIVE &&
    actions.row.canChangeStatus;

  return (
    <>
      <ConfirmDialog
        open={isOpen(actions, CATEGORY_DIALOGS.DISABLE)}
        title={CATEGORIES_MESSAGES.DISABLE_DIALOG.TITLE(name)}
        description={disableDescriptionOf(productCount)}
        confirmLabel={CATEGORIES_MESSAGES.DISABLE_DIALOG.CONFIRM}
        pending={actions.pending}
        onConfirm={actions.confirmDisable}
        onClose={actions.closeDialog}
      />
      <ConfirmDialog
        open={isOpen(actions, CATEGORY_DIALOGS.DELETE)}
        title={CATEGORIES_MESSAGES.DELETE_DIALOG.TITLE(name)}
        description={CATEGORIES_MESSAGES.DELETE_DIALOG.DESCRIPTION}
        confirmLabel={CATEGORIES_MESSAGES.DELETE_DIALOG.CONFIRM}
        pending={actions.pending}
        error={actions.target?.error}
        onConfirm={actions.confirmDelete}
        onClose={actions.closeDialog}
      >
        {offersDisable && (
          <Button variant="outline" disabled={actions.pending} onClick={actions.disableInstead}>
            {CATEGORIES_MESSAGES.DISABLE_INSTEAD}
          </Button>
        )}
      </ConfirmDialog>
    </>
  );
}
