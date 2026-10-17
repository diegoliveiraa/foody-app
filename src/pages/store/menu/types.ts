import type { CartQuote } from "@/@types/menu";

export interface CartQuoteModel {
  quote: CartQuote | undefined;
  quoting: boolean;
  error: string | null;
  hasUnavailable: boolean;
}
