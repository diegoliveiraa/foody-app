import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "@/@types/menu";
import { CART_MAX_DISTINCT_PRODUCTS, CART_MAX_QUANTITY, CART_MIN_QUANTITY } from "@/constants/cart";

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const STEP: number = 1;

const NO_UNITS: number = 0;

function findItem(items: readonly CartItem[], productId: string): CartItem | undefined {
  return items.find((item: CartItem): boolean => item.productId === productId);
}

export function canAddToCart(items: readonly CartItem[], productId: string): boolean {
  const item: CartItem | undefined = findItem(items, productId);
  if (item === undefined) {
    return items.length < CART_MAX_DISTINCT_PRODUCTS;
  }
  return item.quantity < CART_MAX_QUANTITY;
}

function increment(item: CartItem): void {
  item.quantity = Math.min(item.quantity + STEP, CART_MAX_QUANTITY);
}

function emptied(): CartState {
  return { items: [] };
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    itemAdded: (state: CartState, { payload: productId }: PayloadAction<string>): void => {
      const item: CartItem | undefined = findItem(state.items, productId);
      if (item !== undefined) {
        increment(item);
        return;
      }
      if (!canAddToCart(state.items, productId)) {
        return;
      }
      state.items.push({ productId, quantity: CART_MIN_QUANTITY });
    },
    itemIncremented: (state: CartState, { payload: productId }: PayloadAction<string>): void => {
      const item: CartItem | undefined = findItem(state.items, productId);
      if (item === undefined) {
        return;
      }
      increment(item);
    },
    itemDecremented: (state: CartState, { payload: productId }: PayloadAction<string>): void => {
      const item: CartItem | undefined = findItem(state.items, productId);
      if (item === undefined) {
        return;
      }
      item.quantity -= STEP;
      state.items = state.items.filter(
        (line: CartItem): boolean => line.quantity >= CART_MIN_QUANTITY,
      );
    },
    itemRemoved: (state: CartState, { payload: productId }: PayloadAction<string>): void => {
      state.items = state.items.filter((line: CartItem): boolean => line.productId !== productId);
    },
    cartCleared: emptied,
    cartReset: emptied,
    cartRestored: (state: CartState, { payload: items }: PayloadAction<CartItem[]>): void => {
      state.items = items;
    },
  },
  selectors: {
    selectCartItems: (state: CartState): CartItem[] => state.items,
    selectCartCount: (state: CartState): number =>
      state.items.reduce(
        (count: number, item: CartItem): number => count + item.quantity,
        NO_UNITS,
      ),
  },
});

export const {
  itemAdded,
  itemIncremented,
  itemDecremented,
  itemRemoved,
  cartCleared,
  cartReset,
  cartRestored,
} = cartSlice.actions;

export const { selectCartItems, selectCartCount } = cartSlice.selectors;
