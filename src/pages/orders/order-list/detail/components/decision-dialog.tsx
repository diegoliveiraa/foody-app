import type { JSX } from "react";
import { FormAlert } from "@/components/form-alert";
import { TextareaField } from "@/components/textarea-field";
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
import { ORDER_ACTION_MESSAGES } from "../../constants/messages";
import { DECISIONS } from "../constants";
import { DECISION_COPY, ORDER_DETAIL_MESSAGES } from "../constants/messages";
import type { DecisionCopy, DecisionModel } from "../types";

interface DecisionDialogProps {
  orderNumber: number;
  model: DecisionModel;
}

export function DecisionDialog({ orderNumber, model }: DecisionDialogProps): JSX.Element | null {
  if (model.dialog === null) {
    return null;
  }
  const copy: DecisionCopy = DECISION_COPY[model.dialog.decision];
  const approving: boolean = model.dialog.decision === DECISIONS.APPROVE;

  return (
    <Dialog
      open={model.dialog.open}
      onOpenChange={(next: boolean): void => {
        if (!next) {
          model.close();
        }
      }}
    >
      <DialogContent>
        <form noValidate onSubmit={model.submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{copy.title(orderNumber)}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          <FormAlert message={model.form.formState.errors.root?.message} />
          <TextareaField
            label={ORDER_DETAIL_MESSAGES.DECISION_NOTE}
            error={model.form.formState.errors.note?.message}
            {...model.form.register("note")}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={model.close}>
              {ORDER_ACTION_MESSAGES.BACK}
            </Button>
            <Button
              type="submit"
              variant={approving ? "danger" : "default"}
              disabled={model.sending}
              aria-busy={model.sending}
            >
              {model.sending && <Spinner aria-hidden="true" />}
              {copy.action}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
