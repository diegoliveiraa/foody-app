import { Plus } from "lucide-react";
import type { JSX } from "react";
import type { MeScreen } from "@/@types/me";
import { ListPagination } from "@/components/list-pagination";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SCREEN_KEYS } from "@/constants/screens";
import { useMeScreen } from "@/hooks/use-me-screen";
import { ProductDialogs } from "./components/product-dialogs";
import { ProductFormSheet } from "./components/product-form-sheet";
import { ProductsResults } from "./components/products-results";
import { ProductsToolbar } from "./components/products-toolbar";
import { PRODUCTS_MESSAGES } from "./constants/messages";
import { useProductActions } from "./hooks/use-product-actions";
import { useProductCategories } from "./hooks/use-product-categories";
import { useProductForm } from "./hooks/use-product-form";
import { useProductsList } from "./hooks/use-products-list";
import type {
  ProductActionsModel,
  ProductCategoryOptions,
  ProductFormModel,
  ProductsListModel,
} from "./types";

export function ProductsScreen(): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.CATALOG_PRODUCTS);
  const list: ProductsListModel = useProductsList();
  const categories: ProductCategoryOptions = useProductCategories();
  const form: ProductFormModel = useProductForm();
  const actions: ProductActionsModel = useProductActions(form.openEdit);

  return (
    <>
      <PageHeader title={screen?.label}>
        {form.canCreate && (
          <Button onClick={form.openCreate} className="max-sm:w-11 max-sm:px-0">
            <Plus aria-hidden="true" />
            <span className="max-sm:sr-only">{PRODUCTS_MESSAGES.NEW}</span>
          </Button>
        )}
      </PageHeader>
      <section className="flex flex-1 flex-col gap-4 px-4 pb-8 md:px-8">
        <ProductsToolbar filter={list.filter} actions={list.actions} categories={categories} />
        <ProductsResults list={list} actions={actions.row} />
        {list.pagination && (
          <ListPagination
            meta={list.pagination}
            onPageChange={list.actions.changePage}
            onPageSizeChange={list.actions.changePageSize}
          />
        )}
      </section>
      <ProductFormSheet model={form} categories={categories.categories} />
      <ProductDialogs actions={actions} />
    </>
  );
}
