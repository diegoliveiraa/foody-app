import type { JSX } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/utils/format-money";
import { MENU_MESSAGES } from "../../constants/messages";
import type { CartQuoteModel } from "../../../types";

interface BagSummaryProps {
  count: number;
  quote: CartQuoteModel;
}

function Total({ quote }: { quote: CartQuoteModel }): JSX.Element {
  if (quote.quote !== undefined) {
    return <span>{formatMoney(quote.quote.total)}</span>;
  }
  if (quote.quoting) {
    return <Skeleton className="h-6 w-24" />;
  }
  return <span>{MENU_MESSAGES.BAG.NO_TOTAL}</span>;
}

export function BagSummary({ count, quote }: BagSummaryProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label={MENU_MESSAGES.BAG.SUMMARY}
      aria-busy={quote.quoting}
      className="flex flex-col gap-2 rounded-2xl bg-background px-4 py-3.5"
    >
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{MENU_MESSAGES.BAG.ITEMS}</span>
        <span>{count}</span>
      </div>
      <div className="flex items-center justify-between text-lg font-bold">
        <span>{MENU_MESSAGES.BAG.TOTAL}</span>
        <Total quote={quote} />
      </div>
    </div>
  );
}
