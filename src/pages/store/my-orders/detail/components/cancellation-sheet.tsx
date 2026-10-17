import type { JSX } from "react";
import type { CustomerOrder } from "@/@types/orders";
import { CancellationReasonFields } from "@/components/cancellation-reason-fields";
import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { MESSAGES } from "@/constants/messages";
import { SHEET_COPY, TRACKING_MESSAGES } from "../constants/messages";
import type { CancellationModel, SheetCopy } from "../types";

interface CancellationSheetProps {
  order: CustomerOrder;
  model: CancellationModel;
}

export function CancellationSheet({ order, model }: CancellationSheetProps): JSX.Element | null {
  if (model.sheet === null) {
    return null;
  }
  const copy: SheetCopy = SHEET_COPY[model.sheet.mode];

  return (
    <Drawer
      open={model.sheet.open}
      onOpenChange={(next: boolean): void => {
        if (!next) {
          model.close();
        }
      }}
    >
      <DrawerContent>
        <form
          noValidate
          onSubmit={model.submit}
          className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-[max(1.75rem,env(safe-area-inset-bottom))]"
        >
          <DrawerHeader className="gap-1.5 p-0 text-left">
            <DrawerTitle className="text-[22px] font-bold">{copy.title}</DrawerTitle>
            <DrawerDescription>{MESSAGES.ORDERS.TITLE(order.number)}</DrawerDescription>
            {copy.explanation && (
              <p className="text-sm leading-relaxed text-muted-foreground">{copy.explanation}</p>
            )}
          </DrawerHeader>
          <FormAlert message={model.form.formState.errors.root?.message} />
          <CancellationReasonFields
            form={model.form}
            reasons={order.cancellationReasons}
            legend={TRACKING_MESSAGES.REASON_LEGEND}
          />
          <div className="flex flex-col gap-2.5">
            <Button
              type="submit"
              size="lg"
              disabled={model.sending}
              aria-busy={model.sending}
              className="h-13 rounded-[14px] text-base"
            >
              {model.sending && <Spinner aria-hidden="true" />}
              {copy.submit}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={model.close}
              className="h-12 rounded-[14px] text-[15px]"
            >
              {TRACKING_MESSAGES.KEEP_ORDER}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
