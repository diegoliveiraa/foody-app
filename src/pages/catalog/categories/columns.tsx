import { createColumnHelper, type CellContext, type ColumnHelper } from "@tanstack/react-table";
import type { JSX } from "react";
import type { CatalogStatus, Category } from "@/@types/catalog";
import type { DataTableColumns, DataTableFeatures } from "@/components/data-table/features";
import { StatusBadge } from "@/components/status-badge";
import { MESSAGES } from "@/constants/messages";
import { CategoryActionsMenu } from "./components/category-actions-menu";
import { CATEGORY_COLUMNS } from "./constants";
import { CATEGORIES_MESSAGES, CATEGORY_STATUS_LABELS } from "./constants/messages";
import type { CategoryRowActions } from "./types";

type CategoryCell<TValue> = CellContext<DataTableFeatures, Category, TValue>;

const column: ColumnHelper<DataTableFeatures, Category> = createColumnHelper<
  DataTableFeatures,
  Category
>();

export function buildCategoryColumns(actions: CategoryRowActions): DataTableColumns<Category> {
  return column.columns([
    column.accessor(CATEGORY_COLUMNS.NAME, {
      header: MESSAGES.FIELDS.NAME,
      cell: ({ getValue }: CategoryCell<string>): JSX.Element => (
        <span className="font-semibold whitespace-normal text-foreground">{getValue()}</span>
      ),
    }),
    column.accessor(CATEGORY_COLUMNS.DISPLAY_ORDER, {
      header: CATEGORIES_MESSAGES.COLUMNS.DISPLAY_ORDER,
    }),
    column.accessor(CATEGORY_COLUMNS.PRODUCT_COUNT, {
      header: CATEGORIES_MESSAGES.COLUMNS.PRODUCTS,
    }),
    column.accessor(CATEGORY_COLUMNS.STATUS, {
      header: CATEGORIES_MESSAGES.COLUMNS.STATUS,
      cell: ({ getValue }: CategoryCell<CatalogStatus>): JSX.Element => (
        <StatusBadge status={getValue()} label={CATEGORY_STATUS_LABELS[getValue()]} />
      ),
    }),
    column.display({
      id: CATEGORY_COLUMNS.ACTIONS,
      header: (): JSX.Element => (
        <span className="sr-only">{CATEGORIES_MESSAGES.COLUMNS.ACTIONS}</span>
      ),
      cell: ({ row }: CategoryCell<unknown>): JSX.Element => (
        <div className="-my-1 flex justify-end">
          <CategoryActionsMenu category={row.original} actions={actions} />
        </div>
      ),
    }),
  ]);
}
