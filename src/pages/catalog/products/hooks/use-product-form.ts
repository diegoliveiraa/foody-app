import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Product } from "@/@types/catalog";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useFormApiErrors } from "@/hooks/use-form-api-errors";
import { useCreateProductMutation, useUpdateProductMutation } from "@/services/catalog";
import {
  PRODUCT_FIELDS,
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/services/validation-schemas/product";
import { withClosed } from "@/utils/dialog-target";
import { PRODUCT_ERROR_FIELDS } from "../constants";
import { PRODUCTS_MESSAGES } from "../constants/messages";
import type { ProductForm, ProductFormModel, ProductSheetState } from "../types";
import { EMPTY_PRODUCT_FORM, toProductFormInput } from "../utils/to-form-input";

const CLOSED: ProductSheetState = { open: false, product: null };

export function useProductForm(): ProductFormModel {
  const canCreate: boolean = useCan(SCREEN_KEYS.CATALOG_PRODUCTS, SCREEN_ACTIONS.CREATE);
  const [sheet, setSheet] = useState<ProductSheetState>(CLOSED);
  const form: ProductForm = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_PRODUCT_FORM,
  });
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const resetForm: ProductForm["reset"] = form.reset;
  const showError: (error: unknown) => void = useFormApiErrors(
    form.setError,
    PRODUCT_FIELDS,
    PRODUCT_ERROR_FIELDS,
  );

  const openCreate = useCallback((): void => {
    resetForm(EMPTY_PRODUCT_FORM);
    setSheet({ open: true, product: null });
  }, [resetForm]);

  const openEdit = useCallback(
    (product: Product): void => {
      resetForm(toProductFormInput(product));
      setSheet({ open: true, product });
    },
    [resetForm],
  );

  const close = useCallback((): void => {
    setSheet(withClosed);
  }, []);

  const save = async (values: ProductFormValues): Promise<void> => {
    if (sheet.product === null) {
      const created: Product = await createProduct(values).unwrap();
      toast.success(PRODUCTS_MESSAGES.CREATED(created.name));
      close();
      return;
    }
    const updated: Product = await updateProduct({ id: sheet.product.id, ...values }).unwrap();
    toast.success(PRODUCTS_MESSAGES.UPDATED(updated.name));
    close();
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    form.handleSubmit(save)(event).catch(showError);
  };

  return {
    open: sheet.open,
    editing: sheet.product,
    form,
    canCreate,
    openCreate,
    openEdit,
    close,
    submit,
  };
}
