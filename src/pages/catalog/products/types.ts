import type { FormEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Category, Product } from "@/@types/catalog";
import type { PageMeta } from "@/@types/pagination";
import type { ProductFormInput, ProductFormValues } from "@/services/validation-schemas/product";
import type { PRODUCT_DIALOGS } from "./constants";
import type { CategoryFilter, ProductsFilterModel } from "./filter/types";

export type ProductDialog = (typeof PRODUCT_DIALOGS)[keyof typeof PRODUCT_DIALOGS];

export type ProductForm = UseFormReturn<ProductFormInput, unknown, ProductFormValues>;

export interface ProductSheetState {
  open: boolean;
  product: Product | null;
}

export interface ProductDialogTarget {
  dialog: ProductDialog;
  product: Product;
  open: boolean;
  error?: string;
}

export interface ProductRowActions {
  canEdit: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  edit: (product: Product) => void;
  disable: (product: Product) => void;
  enable: (product: Product) => void;
  remove: (product: Product) => void;
}

export interface ProductActionsModel {
  row: ProductRowActions;
  target: ProductDialogTarget | null;
  closeDialog: () => void;
  confirmDisable: () => void;
  confirmDelete: () => void;
  disableInstead: () => void;
  pending: boolean;
}

export interface ProductCategoryOptions {
  categories: readonly Category[];
  filterOptions: readonly CategoryFilter[];
  filterLabels: Readonly<Record<CategoryFilter, string>>;
}

export interface ProductsListModel extends ProductsFilterModel {
  products: readonly Product[];
  pagination: PageMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadError: string | null;
}

export interface ProductFormModel {
  open: boolean;
  editing: Product | null;
  form: ProductForm;
  canCreate: boolean;
  openCreate: () => void;
  openEdit: (product: Product) => void;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}
