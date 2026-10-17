import type { JSX } from "react";
import { FormAlert } from "@/components/form-alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/utils/format-money";
import type { CartQuoteModel } from "../../types";
import { CHECKOUT_MESSAGES } from "../constants/messages";
import type { SummaryLine } from "../types";

interface CheckoutSummaryProps {
  quote: CartQuoteModel;
  lines: readonly SummaryLine[];
  pendingLines: number;
}

function indexes(count: number): number[] {
  return Array.from({ length: count }, (_line: unknown, index: number): number => index);
}

function SummaryRow({ line }: { line: SummaryLine }): JSX.Element {
  if (!line.available) {
    return (
      <li className="flex items-center justify-between gap-3 text-[15px] text-muted-foreground">
        <span className="min-w-0 break-words">{line.label}</span>
        <Badge variant="destructive">{CHECKOUT_MESSAGES.UNAVAILABLE}</Badge>
      </li>
    );
  }
  return (
    <li className="flex justify-between gap-3 text-[15px]">
      <span className="min-w-0 break-words">{line.label}</span>
      {line.subtotal !== null && <span className="shrink-0">{formatMoney(line.subtotal)}</span>}
    </li>
  );
}

function SummaryRows({ quote, lines, pendingLines }: CheckoutSummaryProps): JSX.Element {
  if (quote.quote === undefined && quote.quoting) {
    return (
      <ul className="flex flex-col gap-2">
        {indexes(pendingLines).map((line: number): JSX.Element => (
          <li key={line} className="flex justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16" />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {lines.map((line: SummaryLine): JSX.Element => (
        <SummaryRow key={line.productId} line={line} />
      ))}
    </ul>
  );
}

function SummaryTotal({ quote }: { quote: CartQuoteModel }): JSX.Element | null {
  if (quote.quote !== undefined) {
    return <span>{formatMoney(quote.quote.total)}</span>;
  }
  if (quote.quoting) {
    return <Skeleton className="h-6 w-24" />;
  }
  return null;
}

export function CheckoutSummary({ quote, lines, pendingLines }: CheckoutSummaryProps): JSX.Element {
  return (
    <section
      aria-label={CHECKOUT_MESSAGES.SUMMARY}
      aria-busy={quote.quoting}
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4"
    >
      <h2 className="font-sans text-base font-bold">{CHECKOUT_MESSAGES.SUMMARY}</h2>
      <SummaryRows quote={quote} lines={lines} pendingLines={pendingLines} />
      <Separator />
      <div className="flex items-center justify-between gap-3 text-lg font-bold">
        <span>{CHECKOUT_MESSAGES.TOTAL}</span>
        <SummaryTotal quote={quote} />
      </div>
      <FormAlert message={quote.error ?? undefined} />
      {quote.hasUnavailable && <FormAlert message={CHECKOUT_MESSAGES.UNAVAILABLE_NOTICE} />}
    </section>
  );
}
