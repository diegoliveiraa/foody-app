import {
  rowSortingFeature,
  tableFeatures,
  type RowData,
  type TableOptions,
} from "@tanstack/react-table";

export const DATA_TABLE_FEATURES: { rowSortingFeature: typeof rowSortingFeature } = tableFeatures({
  rowSortingFeature,
});

export type DataTableFeatures = typeof DATA_TABLE_FEATURES;

export type DataTableColumns<TData extends RowData> = TableOptions<
  DataTableFeatures,
  TData
>["columns"];
