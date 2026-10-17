import { ShoppingBag, X } from "lucide-react";
import type { JSX } from "react";
import { EmptyState } from "@/components/empty-state";
import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { MENU_MESSAGES } from "../../constants/messages";
import type { CartQuoteModel } from "../../../types";
import type { BagLine, BagModel, CartModel } from "../../types";
import { BagLineItem } from "./bag-line";
import { BagSummary } from "./bag-summary";

interface BagDrawerProps {
  bag: BagModel;
  cart: CartModel;
  quote: CartQuoteModel;
}

function BagLines({ bag, cart }: Pick<BagDrawerProps, "bag" | "cart">): JSX.Element {
  if (bag.lines.length === 0) {
    return <EmptyState icon={ShoppingBag} title={MENU_MESSAGES.BAG.EMPTY} />;
  }
  return (
    <ul aria-label={MENU_MESSAGES.BAG.LINES}>
      {bag.lines.map((line: BagLine): JSX.Element => (
        <BagLineItem key={line.productId} line={line} cart={cart} />
      ))}
    </ul>
  );
}

export function BagDrawer({ bag, cart, quote }: BagDrawerProps): JSX.Element {
  return (
    <Drawer open={bag.open} onOpenChange={bag.changeOpen}>
      <DrawerContent>
        <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          <DrawerHeader className="flex-row items-center justify-between gap-3 p-0">
            <DrawerTitle className="text-[22px] font-bold">{MENU_MESSAGES.BAG.TITLE}</DrawerTitle>
            <DrawerDescription className="sr-only">
              {MENU_MESSAGES.BAG.DESCRIPTION}
            </DrawerDescription>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={MENU_MESSAGES.BAG.CLOSE}
                className="rounded-full bg-muted"
              >
                <X aria-hidden="true" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <BagLines bag={bag} cart={cart} />
          <Button
            type="button"
            variant="link"
            onClick={bag.hide}
            className="self-start px-0 text-[15px]"
          >
            {MENU_MESSAGES.BAG.ADD_MORE}
          </Button>
          <FormAlert message={quote.error ?? undefined} />
          {quote.hasUnavailable && <FormAlert message={MENU_MESSAGES.BAG.UNAVAILABLE_NOTICE} />}
          <BagSummary count={cart.count} quote={quote} />
          <Button
            type="button"
            size="lg"
            disabled={!bag.canContinue}
            onClick={bag.proceed}
            className="h-14 rounded-2xl text-base"
          >
            {MENU_MESSAGES.BAG.CONTINUE}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
