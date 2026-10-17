import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Category } from "@/@types/catalog";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useFormApiErrors } from "@/hooks/use-form-api-errors";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/services/catalog";
import {
  CATEGORY_FIELDS,
  categorySchema,
  type CategoryFormInput,
  type CategoryFormValues,
} from "@/services/validation-schemas/category";
import { withClosed } from "@/utils/dialog-target";
import { CATEGORY_ERROR_FIELDS } from "../constants";
import { CATEGORIES_MESSAGES } from "../constants/messages";
import type { CategoryDialogState, CategoryForm, CategoryFormModel } from "../types";
import { newCategoryFormInput, toCategoryFormInput } from "../utils/to-form-input";

const CLOSED: CategoryDialogState = { open: false, category: null };

export function useCategoryForm(categories: readonly Category[]): CategoryFormModel {
  const canCreate: boolean = useCan(SCREEN_KEYS.CATALOG_CATEGORIES, SCREEN_ACTIONS.CREATE);
  const [dialog, setDialog] = useState<CategoryDialogState>(CLOSED);
  const form: CategoryForm = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: newCategoryFormInput(categories),
  });
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const resetForm: CategoryForm["reset"] = form.reset;
  const showError: (error: unknown) => void = useFormApiErrors(
    form.setError,
    CATEGORY_FIELDS,
    CATEGORY_ERROR_FIELDS,
  );

  const openCreate = useCallback((): void => {
    resetForm(newCategoryFormInput(categories));
    setDialog({ open: true, category: null });
  }, [categories, resetForm]);

  const openEdit = useCallback(
    (category: Category): void => {
      resetForm(toCategoryFormInput(category));
      setDialog({ open: true, category });
    },
    [resetForm],
  );

  const close = useCallback((): void => {
    setDialog(withClosed);
  }, []);

  const save = async (values: CategoryFormValues): Promise<void> => {
    if (dialog.category === null) {
      const created: Category = await createCategory(values).unwrap();
      toast.success(CATEGORIES_MESSAGES.CREATED(created.name));
      close();
      return;
    }
    const updated: Category = await updateCategory({ id: dialog.category.id, ...values }).unwrap();
    toast.success(CATEGORIES_MESSAGES.UPDATED(updated.name));
    close();
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    form.handleSubmit(save)(event).catch(showError);
  };

  return {
    open: dialog.open,
    editing: dialog.category,
    form,
    canCreate,
    openCreate,
    openEdit,
    close,
    submit,
  };
}
