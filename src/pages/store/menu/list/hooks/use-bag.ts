import { useCallback, useMemo, useState } from "react";
import { useNavigate, type NavigateFunction } from "react-router";
import { useNotifyError } from "@/hooks/use-notify-error";
import { CHECKOUT_SEGMENT } from "../../constants";
import type { BagLine, BagModel, CartModel, CartQuoteModel } from "../types";
import { toBagLines } from "../utils/bag-lines";

export function useBag(
  cart: CartModel,
  quote: CartQuoteModel,
  productNames: ReadonlyMap<string, string>,
): BagModel {
  const [open, setOpen] = useState<boolean>(false);
  const navigate: NavigateFunction = useNavigate();
  const notifyError: (error: unknown) => void = useNotifyError();
  const lines: readonly BagLine[] = useMemo(
    (): BagLine[] => toBagLines(cart.items, quote.quote, productNames),
    [cart.items, quote.quote, productNames],
  );
  const canContinue: boolean =
    cart.items.length > 0 && quote.quote !== undefined && !quote.quoting && !quote.hasUnavailable;

  const show = useCallback((): void => {
    setOpen(true);
  }, []);

  const hide = useCallback((): void => {
    setOpen(false);
  }, []);

  const goToCheckout = async (): Promise<void> => {
    setOpen(false);
    await navigate(CHECKOUT_SEGMENT);
  };

  const proceed = (): void => {
    if (!canContinue) {
      return;
    }
    goToCheckout().catch(notifyError);
  };

  return { open, show, hide, changeOpen: setOpen, lines, canContinue, proceed };
}
