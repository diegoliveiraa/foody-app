import type { JSX } from "react";
import type { CatalogStatus, Product } from "@/@types/catalog";
import { RowActionsMenu } from "@/components/row-actions-menu";
import type { RowAction } from "@/components/row-actions-menu/types";
import { CATALOG_STATUSES } from "@/constants/catalog";
import { PRODUCTS_MESSAGES } from "../constants/messages";
import type { ProductRowActions } from "../types";

interface ProductActionsMenuProps {
  product: Product;
  actions: ProductRowActions;
}

const STATUS_ITEMS: Record<
  CatalogStatus,
  (product: Product, actions: ProductRowActions) => RowAction
> = {
  [CATALOG_STATUSES.ACTIVE]: (product: Product, actions: ProductRowActions): RowAction => ({
    label: PRODUCTS_MESSAGES.DISABLE,
    variant: "default",
    select: (): void => actions.disable(product),
  }),
  [CATALOG_STATUSES.DISABLED]: (product: Product, actions: ProductRowActions): RowAction => ({
    label: PRODUCTS_MESSAGES.ENABLE,
    variant: "default",
    select: (): void => actions.enable(product),
  }),
};

function itemsFor(product: Product, actions: ProductRowActions): RowAction[] {
  const editItem: RowAction = {
    label: PRODUCTS_MESSAGES.EDIT,
    variant: "default",
    select: (): void => actions.edit(product),
  };
  const deleteItem: RowAction = {
    label: PRODUCTS_MESSAGES.DELETE,
    variant: "destructive",
    select: (): void => actions.remove(product),
  };
  return [
    ...(actions.canEdit ? [editItem] : []),
    ...(actions.canChangeStatus ? [STATUS_ITEMS[product.status](product, actions)] : []),
    ...(actions.canDelete ? [deleteItem] : []),
  ];
}

export function ProductActionsMenu({
  product,
  actions,
}: ProductActionsMenuProps): JSX.Element | null {
  return <RowActionsMenu name={product.name} items={itemsFor(product, actions)} />;
}
