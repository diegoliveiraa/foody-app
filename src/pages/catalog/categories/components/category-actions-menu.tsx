import type { JSX } from "react";
import type { CatalogStatus, Category } from "@/@types/catalog";
import { RowActionsMenu } from "@/components/row-actions-menu";
import type { RowAction } from "@/components/row-actions-menu/types";
import { CATALOG_STATUSES } from "@/constants/catalog";
import { CATEGORIES_MESSAGES } from "../constants/messages";
import type { CategoryRowActions } from "../types";

interface CategoryActionsMenuProps {
  category: Category;
  actions: CategoryRowActions;
}

const STATUS_ITEMS: Record<
  CatalogStatus,
  (category: Category, actions: CategoryRowActions) => RowAction
> = {
  [CATALOG_STATUSES.ACTIVE]: (category: Category, actions: CategoryRowActions): RowAction => ({
    label: CATEGORIES_MESSAGES.DISABLE,
    variant: "default",
    select: (): void => actions.disable(category),
  }),
  [CATALOG_STATUSES.DISABLED]: (category: Category, actions: CategoryRowActions): RowAction => ({
    label: CATEGORIES_MESSAGES.ENABLE,
    variant: "default",
    select: (): void => actions.enable(category),
  }),
};

function itemsFor(category: Category, actions: CategoryRowActions): RowAction[] {
  const editItem: RowAction = {
    label: CATEGORIES_MESSAGES.EDIT,
    variant: "default",
    select: (): void => actions.edit(category),
  };
  const deleteItem: RowAction = {
    label: CATEGORIES_MESSAGES.DELETE,
    variant: "destructive",
    select: (): void => actions.remove(category),
  };
  return [
    ...(actions.canEdit ? [editItem] : []),
    ...(actions.canChangeStatus ? [STATUS_ITEMS[category.status](category, actions)] : []),
    ...(actions.canDelete ? [deleteItem] : []),
  ];
}

export function CategoryActionsMenu({
  category,
  actions,
}: CategoryActionsMenuProps): JSX.Element | null {
  return <RowActionsMenu name={category.name} items={itemsFor(category, actions)} />;
}
