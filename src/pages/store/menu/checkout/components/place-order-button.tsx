import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { formatMoney } from "@/utils/format-money";
import type { CartQuoteModel } from "../../types";
import { CHECKOUT_MESSAGES } from "../constants/messages";

interface PlaceOrderButtonProps {
  quote: CartQuoteModel;
  placing: boolean;
  disabled: boolean;
}

function ButtonTotal({ quote }: { quote: CartQuoteModel }): JSX.Element | null {
  if (quote.quote !== undefined) {
    return <span>{formatMoney(quote.quote.total)}</span>;
  }
  if (quote.quoting) {
    return <Skeleton className="h-5 w-20 bg-primary-foreground/25" />;
  }
  return null;
}

export function PlaceOrderButton({ quote, placing, disabled }: PlaceOrderButtonProps): JSX.Element {
  return (
    <div className="sticky bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+0.75rem)] z-10 md:bottom-6">
      <Button
        type="submit"
        size="lg"
        disabled={disabled}
        aria-busy={placing}
        className="h-14 w-full justify-between rounded-2xl px-5 text-base shadow-lg shadow-primary/30"
      >
        <span className="flex items-center gap-2">
          {placing && <Spinner aria-hidden="true" />}
          {CHECKOUT_MESSAGES.PLACE}
        </span>
        <ButtonTotal quote={quote} />
      </Button>
    </div>
  );
}
