import { useMemo, type JSX } from "react";
import type { Product } from "@/@types/catalog";
import { DataTable } from "@/components/data-table";
import type { DataTableColumns } from "@/components/data-table/features";
import { ResponsiveList } from "@/components/responsive-list";
import { SortSelect } from "@/components/sort-select";
import { buildProductColumns } from "../columns";
import { PRODUCT_SORT_OPTIONS } from "../constants";
import { PRODUCTS_MESSAGES } from "../constants/messages";
import type { ProductRowActions, ProductsListModel } from "../types";
import { ProductCardList } from "./product-card-list";
import { ProductsEmptyState, ProductsLoadError } from "./products-empty-state";

interface ProductsResultsProps {
  list: ProductsListModel;
  actions: ProductRowActions;
}

function productIdOf(product: Product): string {
  return product.id;
}

export function ProductsResults({ list, actions }: ProductsResultsProps): JSX.Element {
  const columns: DataTableColumns<Product> = useMemo(
    (): DataTableColumns<Product> => buildProductColumns(actions),
    [actions],
  );

  if (list.loadError !== null) {
    return <ProductsLoadError detail={list.loadError} />;
  }

  const emptyState: JSX.Element = (
    <ProductsEmptyState hasFilters={list.hasFilters} onClearFilters={list.actions.clearFilters} />
  );

  return (
    <div aria-busy={list.refreshing} className="transition-opacity aria-busy:opacity-60">
      <ResponsiveList
        cards={
          <div className="flex flex-col gap-3">
            <SortSelect
              options={PRODUCT_SORT_OPTIONS}
              sort={list.filter.sort}
              onChange={list.actions.changeSort}
            />
            <ProductCardList
              products={list.products}
              loading={list.loading}
              emptyState={emptyState}
              actions={actions}
            />
          </div>
        }
        table={
          <DataTable
            label={PRODUCTS_MESSAGES.LIST}
            columns={columns}
            data={list.products}
            getRowId={productIdOf}
            sort={list.filter.sort}
            onSortChange={list.actions.changeSort}
            loading={list.loading}
            emptyState={emptyState}
          />
        }
      />
    </div>
  );
}
