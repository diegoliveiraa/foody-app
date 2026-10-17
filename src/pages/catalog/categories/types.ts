import type { FormEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Category } from "@/@types/catalog";
import type { CategoryFormInput, CategoryFormValues } from "@/services/validation-schemas/category";
import type { CATEGORY_DIALOGS, PRODUCT_COUNT_KINDS } from "./constants";

export type CategoryDialog = (typeof CATEGORY_DIALOGS)[keyof typeof CATEGORY_DIALOGS];

export type ProductCountKind = (typeof PRODUCT_COUNT_KINDS)[keyof typeof PRODUCT_COUNT_KINDS];

export type CategoryForm = UseFormReturn<CategoryFormInput, unknown, CategoryFormValues>;

export interface CategoryDialogState {
  open: boolean;
  category: Category | null;
}

export interface CategoryDialogTarget {
  dialog: CategoryDialog;
  category: Category;
  open: boolean;
  error?: string;
}

export interface CategoryRowActions {
  canEdit: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  edit: (category: Category) => void;
  disable: (category: Category) => void;
  enable: (category: Category) => void;
  remove: (category: Category) => void;
}

export interface CategoryActionsModel {
  row: CategoryRowActions;
  target: CategoryDialogTarget | null;
  closeDialog: () => void;
  confirmDisable: () => void;
  confirmDelete: () => void;
  disableInstead: () => void;
  pending: boolean;
}

export interface CategoriesListModel {
  categories: readonly Category[];
  loading: boolean;
  refreshing: boolean;
  loadError: string | null;
}

export interface CategoryFormModel {
  open: boolean;
  editing: Category | null;
  form: CategoryForm;
  canCreate: boolean;
  openCreate: () => void;
  openEdit: (category: Category) => void;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}
