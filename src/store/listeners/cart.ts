import { isAnyOf, type UnknownAction } from "@reduxjs/toolkit";
import type { ZodSafeParseResult } from "zod";
import type { MeResponse } from "@/@types/me";
import type { CartItem } from "@/@types/menu";
import { CART_STORAGE_PREFIX } from "@/constants/cart";
import { meApi } from "@/services/me";
import { storedCartSchema } from "@/services/validation-schemas/stored-cart";
import type { AppDispatch, AppStartListening, RootState } from "@/store";
import {
  cartCleared,
  cartReset,
  cartRestored,
  itemAdded,
  itemDecremented,
  itemIncremented,
  itemRemoved,
  selectCartItems,
} from "@/store/slices/cart";
import { sessionCleared, sessionExpired } from "@/store/slices/session";
import { readStorage, writeStorage } from "@/utils/local-storage";

interface CartListenerApi {
  dispatch: AppDispatch;
  getState: () => RootState;
}

const NO_ITEMS: CartItem[] = [];

const isCartChange = isAnyOf(itemAdded, itemIncremented, itemDecremented, itemRemoved, cartCleared);

const isSessionEnd = isAnyOf(sessionCleared, sessionExpired);

const selectMe = meApi.endpoints.getMe.select();

function storageKeyOf(userId: string): string {
  return `${CART_STORAGE_PREFIX}${userId}`;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function storedCartOf(userId: string): CartItem[] {
  const text: string | null = readStorage(storageKeyOf(userId));
  if (text === null) {
    return NO_ITEMS;
  }
  const parsed: ZodSafeParseResult<CartItem[]> = storedCartSchema.safeParse(parseJson(text));
  return parsed.success ? parsed.data : NO_ITEMS;
}

function saveCart(_action: UnknownAction, { getState }: CartListenerApi): void {
  const state: RootState = getState();
  const userId: string | undefined = selectMe(state).data?.user.id;
  if (userId === undefined) {
    return;
  }
  writeStorage(storageKeyOf(userId), JSON.stringify(selectCartItems(state)));
}

export function listenForCartChanges(startListening: AppStartListening): void {
  startListening({ matcher: isCartChange, effect: saveCart });
  startListening({
    matcher: meApi.endpoints.getMe.matchFulfilled,
    effect: (action: { payload: MeResponse }, { dispatch }: CartListenerApi): void => {
      dispatch(cartRestored(storedCartOf(action.payload.user.id)));
    },
  });
  startListening({
    matcher: isSessionEnd,
    effect: (_action: UnknownAction, { dispatch }: CartListenerApi): void => {
      dispatch(cartReset());
    },
  });
}
