import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, type NavigateFunction } from "react-router";
import { toast } from "sonner";
import type { CartItem } from "@/@types/menu";
import type { CustomerOrder } from "@/@types/orders";
import { ERROR_CODES } from "@/constants/api";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useCan } from "@/hooks/use-can";
import { useFormApiErrors } from "@/hooks/use-form-api-errors";
import { useNotifyError } from "@/hooks/use-notify-error";
import { useScreenPath } from "@/hooks/use-screen-path";
import { joinPath } from "@/routes/navigation";
import { usePlaceOrderMutation } from "@/services/my-orders";
import {
  CHECKOUT_FIELDS,
  checkoutSchema,
  type CheckoutFormInput,
  type CheckoutFormValues,
} from "@/services/validation-schemas/delivery-address";
import type { AppDispatch } from "@/store";
import { cartCleared, selectCartItems } from "@/store/slices/cart";
import { extractApiError } from "@/utils/api-error";
import { useCartQuote } from "../../hooks/use-cart-quote";
import type { CartQuoteModel } from "../../types";
import { EMPTY_CHECKOUT_FORM, NO_CODE_FIELDS } from "../constants";
import { CHECKOUT_MESSAGES } from "../constants/messages";
import type { CheckoutForm, CheckoutModel, SummaryLine } from "../types";
import { toSummaryLines } from "../utils/summary-lines";

function isReady(quote: CartQuoteModel): boolean {
  return (
    quote.quote !== undefined && !quote.quoting && !quote.hasUnavailable && quote.error === null
  );
}

export function useCheckout(): CheckoutModel {
  const items: CartItem[] = useSelector(selectCartItems);
  const quote: CartQuoteModel = useCartQuote(items);
  const canOrder: boolean = useCan(SCREEN_KEYS.STORE_MENU, SCREEN_ACTIONS.PLACE_ORDER);
  const form: CheckoutForm = useForm<CheckoutFormInput, unknown, CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: EMPTY_CHECKOUT_FORM,
  });
  const [placeOrder] = usePlaceOrderMutation();
  const dispatch: AppDispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const myOrdersPath: string = useScreenPath(SCREEN_KEYS.STORE_MY_ORDERS);
  const showFormError: (error: unknown) => void = useFormApiErrors(
    form.setError,
    CHECKOUT_FIELDS,
    NO_CODE_FIELDS,
  );
  const notifyError: (error: unknown) => void = useNotifyError();
  const lines: readonly SummaryLine[] = useMemo(
    (): SummaryLine[] => toSummaryLines(quote.quote),
    [quote.quote],
  );
  const empty: boolean = items.length === 0;
  const placing: boolean = form.formState.isSubmitting;
  const canPlace: boolean = canOrder && !empty && !placing && isReady(quote);

  const place = async ({ deliveryAddress }: CheckoutFormValues): Promise<void> => {
    const order: CustomerOrder = await placeOrder({ items, deliveryAddress }).unwrap();
    toast.success(CHECKOUT_MESSAGES.PLACED(order.number));
    try {
      await navigate(joinPath(myOrdersPath, order.id), { replace: true });
    } finally {
      dispatch(cartCleared());
    }
  };

  const fail = (error: unknown): void => {
    if (extractApiError(error).code === ERROR_CODES.PRODUCT_UNAVAILABLE) {
      notifyError(error);
      return;
    }
    showFormError(error);
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    if (!canPlace) {
      event.preventDefault();
      return;
    }
    form.handleSubmit(place)(event).catch(fail);
  };

  return {
    form,
    quote,
    lines,
    pendingLines: items.length,
    empty,
    placing,
    canPlace,
    submit,
  };
}
