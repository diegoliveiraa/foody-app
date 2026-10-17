import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Category } from "@/@types/catalog";
import { HTTP_STATUS } from "@/constants/api";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useNotifyError } from "@/hooks/use-notify-error";
import {
  useDeleteCategoryMutation,
  useDisableCategoryMutation,
  useEnableCategoryMutation,
} from "@/services/catalog";
import { extractApiError, type ApiErrorInfo } from "@/utils/api-error";
import { closeTarget, withTargetError } from "@/utils/dialog-target";
import { CATEGORY_DIALOGS } from "../constants";
import { CATEGORIES_MESSAGES } from "../constants/messages";
import type {
  CategoryActionsModel,
  CategoryDialog,
  CategoryDialogTarget,
  CategoryRowActions,
} from "../types";

export function useCategoryActions(edit: (category: Category) => void): CategoryActionsModel {
  const canEdit: boolean = useCan(SCREEN_KEYS.CATALOG_CATEGORIES, SCREEN_ACTIONS.UPDATE);
  const canChangeStatus: boolean = useCan(SCREEN_KEYS.CATALOG_CATEGORIES, SCREEN_ACTIONS.DISABLE);
  const canDelete: boolean = useCan(SCREEN_KEYS.CATALOG_CATEGORIES, SCREEN_ACTIONS.DELETE);
  const notifyError: (error: unknown) => void = useNotifyError();
  const [target, setTarget] = useState<CategoryDialogTarget | null>(null);
  const [disableCategory, { isLoading: disabling }] = useDisableCategoryMutation();
  const [enableCategory] = useEnableCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const openDialog = useCallback((dialog: CategoryDialog, category: Category): void => {
    setTarget({ dialog, category, open: true });
  }, []);

  const closeDialog = useCallback((): void => {
    setTarget(closeTarget);
  }, []);

  const enable = useCallback(
    (category: Category): void => {
      enableCategory(category.id)
        .unwrap()
        .then((): void => {
          toast.success(CATEGORIES_MESSAGES.ENABLED(category.name));
        })
        .catch(notifyError);
    },
    [enableCategory, notifyError],
  );

  const disableTarget = (): void => {
    if (target === null) {
      return;
    }
    const { category }: CategoryDialogTarget = target;
    disableCategory(category.id)
      .unwrap()
      .then((): void => {
        toast.success(CATEGORIES_MESSAGES.DISABLED(category.name));
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
    const { category }: CategoryDialogTarget = target;
    deleteCategory(category.id)
      .unwrap()
      .then((): void => {
        toast.success(CATEGORIES_MESSAGES.DELETED(category.name));
        closeDialog();
      })
      .catch(showDeleteError);
  };

  const row: CategoryRowActions = useMemo(
    (): CategoryRowActions => ({
      canEdit,
      canChangeStatus,
      canDelete,
      edit,
      disable: (category: Category): void => openDialog(CATEGORY_DIALOGS.DISABLE, category),
      enable,
      remove: (category: Category): void => openDialog(CATEGORY_DIALOGS.DELETE, category),
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
