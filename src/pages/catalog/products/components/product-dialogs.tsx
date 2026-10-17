import type { JSX } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { CATALOG_STATUSES } from "@/constants/catalog";
import { EMPTY_TEXT } from "@/constants/validation";
import { PRODUCT_DIALOGS } from "../constants";
import { PRODUCTS_MESSAGES } from "../constants/messages";
import type { ProductActionsModel, ProductDialog } from "../types";

interface ProductDialogsProps {
  actions: ProductActionsModel;
}

function isOpen(actions: ProductActionsModel, dialog: ProductDialog): boolean {
  return actions.target?.dialog === dialog && actions.target.open;
}

export function ProductDialogs({ actions }: ProductDialogsProps): JSX.Element {
  const name: string = actions.target?.product.name ?? EMPTY_TEXT;
  const offersDisable: boolean =
    actions.target?.error !== undefined &&
    actions.target.product.status === CATALOG_STATUSES.ACTIVE &&
    actions.row.canChangeStatus;

  return (
    <>
      <ConfirmDialog
        open={isOpen(actions, PRODUCT_DIALOGS.DISABLE)}
        title={PRODUCTS_MESSAGES.DISABLE_DIALOG.TITLE(name)}
        description={PRODUCTS_MESSAGES.DISABLE_DIALOG.DESCRIPTION(name)}
        confirmLabel={PRODUCTS_MESSAGES.DISABLE_DIALOG.CONFIRM}
        pending={actions.pending}
        onConfirm={actions.confirmDisable}
        onClose={actions.closeDialog}
      />
      <ConfirmDialog
        open={isOpen(actions, PRODUCT_DIALOGS.DELETE)}
        title={PRODUCTS_MESSAGES.DELETE_DIALOG.TITLE(name)}
        description={PRODUCTS_MESSAGES.DELETE_DIALOG.DESCRIPTION}
        confirmLabel={PRODUCTS_MESSAGES.DELETE_DIALOG.CONFIRM}
        pending={actions.pending}
        error={actions.target?.error}
        onConfirm={actions.confirmDelete}
        onClose={actions.closeDialog}
      >
        {offersDisable && (
          <Button variant="outline" disabled={actions.pending} onClick={actions.disableInstead}>
            {PRODUCTS_MESSAGES.DISABLE_INSTEAD}
          </Button>
        )}
      </ConfirmDialog>
    </>
  );
}
