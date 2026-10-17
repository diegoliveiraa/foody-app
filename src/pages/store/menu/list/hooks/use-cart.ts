import { useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import type { CartItem, MenuProduct } from "@/@types/menu";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { TOAST_IDS } from "@/constants/toasts";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useCan } from "@/hooks/use-can";
import type { AppDispatch } from "@/store";
import {
  canAddToCart,
  itemAdded,
  itemDecremented,
  itemIncremented,
  itemRemoved,
  selectCartCount,
  selectCartItems,
} from "@/store/slices/cart";
import { MENU_MESSAGES } from "../constants/messages";
import type { CartModel } from "../types";

function limitMessageFor(items: readonly CartItem[], product: MenuProduct): string {
  const inCart: boolean = items.some((item: CartItem): boolean => item.productId === product.id);
  return inCart ? MENU_MESSAGES.QUANTITY_LIMIT(product.name) : MENU_MESSAGES.DISTINCT_LIMIT;
}

export function useCart(): CartModel {
  const items: CartItem[] = useSelector(selectCartItems);
  const count: number = useSelector(selectCartCount);
  const canOrder: boolean = useCan(SCREEN_KEYS.STORE_MENU, SCREEN_ACTIONS.PLACE_ORDER);
  const dispatch: AppDispatch = useAppDispatch();

  const add = useCallback(
    (product: MenuProduct): void => {
      if (!canAddToCart(items, product.id)) {
        toast(limitMessageFor(items, product), { id: TOAST_IDS.CART_LIMIT });
        return;
      }
      dispatch(itemAdded(product.id));
      toast.success(MENU_MESSAGES.ADDED(product.name), { id: TOAST_IDS.CART_ADDED });
    },
    [items, dispatch],
  );

  const increase = useCallback(
    (productId: string): void => {
      dispatch(itemIncremented(productId));
    },
    [dispatch],
  );

  const decrease = useCallback(
    (productId: string): void => {
      dispatch(itemDecremented(productId));
    },
    [dispatch],
  );

  const remove = useCallback(
    (productId: string): void => {
      dispatch(itemRemoved(productId));
    },
    [dispatch],
  );

  return { items, count, canOrder, add, increase, decrease, remove };
}
