import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/@types/catalog";
import { HTTP_STATUS } from "@/constants/api";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useNotifyError } from "@/hooks/use-notify-error";
import {
  useDeleteProductMutation,
  useDisableProductMutation,
  useEnableProductMutation,
} from "@/services/catalog";
import { extractApiError, type ApiErrorInfo } from "@/utils/api-error";
import { closeTarget, withTargetError } from "@/utils/dialog-target";
import { PRODUCT_DIALOGS } from "../constants";
import { PRODUCTS_MESSAGES } from "../constants/messages";
import type {
  ProductActionsModel,
  ProductDialog,
  ProductDialogTarget,
  ProductRowActions,
} from "../types";

export function useProductActions(edit: (product: Product) => void): ProductActionsModel {
  const canEdit: boolean = useCan(SCREEN_KEYS.CATALOG_PRODUCTS, SCREEN_ACTIONS.UPDATE);
  const canChangeStatus: boolean = useCan(SCREEN_KEYS.CATALOG_PRODUCTS, SCREEN_ACTIONS.DISABLE);
  const canDelete: boolean = useCan(SCREEN_KEYS.CATALOG_PRODUCTS, SCREEN_ACTIONS.DELETE);
  const notifyError: (error: unknown) => void = useNotifyError();
  const [target, setTarget] = useState<ProductDialogTarget | null>(null);
  const [disableProduct, { isLoading: disabling }] = useDisableProductMutation();
  const [enableProduct] = useEnableProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const openDialog = useCallback((dialog: ProductDialog, product: Product): void => {
    setTarget({ dialog, product, open: true });
  }, []);

  const closeDialog = useCallback((): void => {
    setTarget(closeTarget);
  }, []);

  const enable = useCallback(
    (product: Product): void => {
      enableProduct(product.id)
        .unwrap()
        .then((): void => {
          toast.success(PRODUCTS_MESSAGES.ENABLED(product.name));
        })
        .catch(notifyError);
    },
    [enableProduct, notifyError],
  );

  const disableTarget = (): void => {
    if (target === null) {
      return;
    }
    const { product }: ProductDialogTarget = target;
    disableProduct(product.id)
      .unwrap()
      .then((): void => {
        toast.success(PRODUCTS_MESSAGES.DISABLED(product.name));
        closeDialog();
      })
      .catch(notifyError);
  };

  const showDeleteError = (error: unknown): void => {
    const info: ApiErrorInfo = extractApiError(error);
    if (info.status !== HTTP_STATUS.CONFLICT) {
      notifyError(error);
      return;
    }
    setTarget(withTargetError(info.detail));
  };

  const confirmDelete = (): void => {
    if (target === null) {
      return;
    }
    const { product }: ProductDialogTarget = target;
    deleteProduct(product.id)
      .unwrap()
      .then((): void => {
        toast.success(PRODUCTS_MESSAGES.DELETED(product.name));
        closeDialog();
      })
      .catch(showDeleteError);
  };

  const row: ProductRowActions = useMemo(
    (): ProductRowActions => ({
      canEdit,
      canChangeStatus,
      canDelete,
      edit,
      disable: (product: Product): void => openDialog(PRODUCT_DIALOGS.DISABLE, product),
      enable,
      remove: (product: Product): void => openDialog(PRODUCT_DIALOGS.DELETE, product),
    }),
    [canEdit, canChangeStatus, canDelete, edit, enable, openDialog],
  );

  return {
    row,
    target,
    closeDialog,
    confirmDisable: disableTarget,
    confirmDelete,
    disableInstead: disableTarget,
    pending: disabling || deleting,
  };
}
