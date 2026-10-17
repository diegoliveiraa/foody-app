import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/utils/format-money";
import { MENU_MESSAGES } from "../constants/messages";
import type { CartQuoteModel } from "../types";

interface CartBarProps {
  count: number;
  quote: CartQuoteModel;
  onOpen: () => void;
}

function CartBarTotal({ quote }: { quote: CartQuoteModel }): JSX.Element | null {
  if (quote.quote !== undefined) {
    return <span className="text-base font-bold">{formatMoney(quote.quote.total)}</span>;
  }
  if (quote.quoting) {
    return <Skeleton className="h-5 w-20 bg-primary-foreground/25" />;
  }
  return null;
}

export function CartBar({ count, quote, onOpen }: CartBarProps): JSX.Element {
  return (
    <div className="fixed inset-x-4 bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+0.75rem)] z-30 mx-auto max-w-xl md:bottom-6">
      <Button
        type="button"
        onClick={onOpen}
        className="h-14 w-full justify-between rounded-2xl px-4 text-[15px] shadow-lg shadow-primary/30"
      >
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-6.5 min-w-6.5 items-center justify-center rounded-full bg-primary-foreground/20 px-1.5 text-[13px]"
          >
            {count}
          </span>
          <span className="sr-only">{MENU_MESSAGES.UNITS(count)}</span>
          {MENU_MESSAGES.VIEW_BAG}
        </span>
        <CartBarTotal quote={quote} />
      </Button>
    </div>
  );
}
