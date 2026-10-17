import type { CartItem, MenuCategory, MenuProduct } from "@/@types/menu";
import type { CategoryChoice, MenuFilterModel } from "./filter/types";

export interface BagLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number | null;
  subtotal: number | null;
  available: boolean;
  canIncrease: boolean;
}

export interface CategoryChip {
  id: CategoryChoice;
  label: string;
}

export interface MenuModel extends MenuFilterModel {
  categories: readonly MenuCategory[];
  sections: readonly MenuCategory[];
  chips: readonly CategoryChip[];
  productNames: ReadonlyMap<string, string>;
  loading: boolean;
  loadError: string | null;
}

export interface CartModel {
  items: CartItem[];
  count: number;
  canOrder: boolean;
  add: (product: MenuProduct) => void;
  increase: (productId: string) => void;
  decrease: (productId: string) => void;
  remove: (productId: string) => void;
}

export interface BagModel {
  open: boolean;
  show: () => void;
  hide: () => void;
  changeOpen: (open: boolean) => void;
  lines: readonly BagLine[];
  canContinue: boolean;
  proceed: () => void;
}
