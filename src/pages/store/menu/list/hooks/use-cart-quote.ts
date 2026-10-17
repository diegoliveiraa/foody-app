import { useMemo } from "react";
import type { CartItem, CartQuote, QuoteRequest, QuotedItem } from "@/@types/menu";
import { useQuoteCartQuery } from "@/services/menu";
import { extractApiError } from "@/utils/api-error";
import type { CartQuoteModel } from "../types";

function hasUnavailableItems(quote: CartQuote | undefined): boolean {
  return (quote?.items ?? []).some((item: QuotedItem): boolean => !item.available);
}

export function useCartQuote(items: CartItem[]): CartQuoteModel {
  const empty: boolean = items.length === 0;
  const request: QuoteRequest = useMemo((): QuoteRequest => ({ items }), [items]);
  const { currentData, error, isError } = useQuoteCartQuery(request, { skip: empty });
  const errorDetail: string | null = useMemo(
    (): string | null => (isError ? extractApiError(error).detail : null),
    [isError, error],
  );
  const quote: CartQuote | undefined = empty ? undefined : currentData;

  return {
    quote,
    quoting: !empty && quote === undefined && !isError,
    error: empty ? null : errorDetail,
    hasUnavailable: hasUnavailableItems(quote),
  };
}
