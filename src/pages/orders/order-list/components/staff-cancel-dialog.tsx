import type { JSX } from "react";
import type { CancellationReason } from "@/@types/orders";
import { CancellationReasonFields } from "@/components/cancellation-reason-fields";
import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ORDER_ACTION_MESSAGES } from "../constants/messages";
import type { CancelDialogModel } from "../types";

interface StaffCancelDialogProps {
  orderNumber: number;
  reasons: readonly CancellationReason[];
  model: CancelDialogModel;
}

export function StaffCancelDialog({
  orderNumber,
  reasons,
  model,
}: StaffCancelDialogProps): JSX.Element {
  return (
    <Dialog
      open={model.open}
      onOpenChange={(next: boolean): void => {
        if (!next) {
          model.close();
        }
      }}
    >
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto">
        <form noValidate onSubmit={model.submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{ORDER_ACTION_MESSAGES.CANCEL_TITLE(orderNumber)}</DialogTitle>
            <DialogDescription>{ORDER_ACTION_MESSAGES.CANCEL_DESCRIPTION}</DialogDescription>
          </DialogHeader>
          <FormAlert message={model.form.formState.errors.root?.message} />
          <CancellationReasonFields
            form={model.form}
            reasons={reasons}
            legend={ORDER_ACTION_MESSAGES.REASON_LEGEND}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={model.close}>
              {ORDER_ACTION_MESSAGES.BACK}
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={model.sending}
              aria-busy={model.sending}
            >
              {model.sending && <Spinner aria-hidden="true" />}
              {ORDER_ACTION_MESSAGES.CANCEL_ORDER}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
