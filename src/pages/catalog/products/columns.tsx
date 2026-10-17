import { createColumnHelper, type CellContext, type ColumnHelper } from "@tanstack/react-table";
import type { JSX } from "react";
import type { CatalogStatus, Product, ProductCategory } from "@/@types/catalog";
import type { DataTableColumns, DataTableFeatures } from "@/components/data-table/features";
import { StatusBadge } from "@/components/status-badge";
import { MESSAGES } from "@/constants/messages";
import { formatDate } from "@/utils/format-date";
import { formatMoney } from "@/utils/format-money";
import { ProductActionsMenu } from "./components/product-actions-menu";
import { PRODUCT_COLUMNS } from "./constants";
import { PRODUCT_STATUS_LABELS, PRODUCTS_MESSAGES } from "./constants/messages";
import type { ProductRowActions } from "./types";

type ProductCell<TValue> = CellContext<DataTableFeatures, Product, TValue>;

const column: ColumnHelper<DataTableFeatures, Product> = createColumnHelper<
  DataTableFeatures,
  Product
>();

export function buildProductColumns(actions: ProductRowActions): DataTableColumns<Product> {
  return column.columns([
    column.accessor(PRODUCT_COLUMNS.NAME, {
      header: MESSAGES.FIELDS.NAME,
      cell: ({ getValue }: ProductCell<string>): JSX.Element => (
        <span className="font-semibold whitespace-normal text-foreground">{getValue()}</span>
      ),
    }),
    column.accessor(PRODUCT_COLUMNS.CATEGORY, {
      header: PRODUCTS_MESSAGES.COLUMNS.CATEGORY,
      enableSorting: false,
      cell: ({ getValue }: ProductCell<ProductCategory>): JSX.Element => (
        <span className="text-muted-foreground">{getValue().name}</span>
      ),
    }),
    column.accessor(PRODUCT_COLUMNS.PRICE, {
      header: PRODUCTS_MESSAGES.COLUMNS.PRICE,
      cell: ({ getValue }: ProductCell<number>): string => formatMoney(getValue()),
    }),
    column.accessor(PRODUCT_COLUMNS.STATUS, {
      header: PRODUCTS_MESSAGES.COLUMNS.STATUS,
      enableSorting: false,
      cell: ({ getValue }: ProductCell<CatalogStatus>): JSX.Element => (
        <StatusBadge status={getValue()} label={PRODUCT_STATUS_LABELS[getValue()]} />
      ),
    }),
    column.accessor(PRODUCT_COLUMNS.CREATED_AT, {
      header: PRODUCTS_MESSAGES.COLUMNS.CREATED_AT,
      cell: ({ getValue }: ProductCell<string>): string => formatDate(getValue()),
    }),
    column.display({
      id: PRODUCT_COLUMNS.ACTIONS,
      header: (): JSX.Element => (
        <span className="sr-only">{PRODUCTS_MESSAGES.COLUMNS.ACTIONS}</span>
      ),
      cell: ({ row }: ProductCell<unknown>): JSX.Element => (
        <div className="-my-1 flex justify-end">
          <ProductActionsMenu product={row.original} actions={actions} />
        </div>
      ),
    }),
  ]);
}
