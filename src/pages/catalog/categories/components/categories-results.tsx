import { CircleAlert, Tags } from "lucide-react";
import { useMemo, type JSX } from "react";
import type { Category } from "@/@types/catalog";
import { DataTable } from "@/components/data-table";
import type { DataTableColumns } from "@/components/data-table/features";
import { EmptyState } from "@/components/empty-state";
import { ResponsiveList } from "@/components/responsive-list";
import { buildCategoryColumns } from "../columns";
import { CATEGORIES_MESSAGES } from "../constants/messages";
import type { CategoriesListModel, CategoryRowActions } from "../types";
import { CategoryCardList } from "./category-card-list";

interface CategoriesResultsProps {
  list: CategoriesListModel;
  actions: CategoryRowActions;
}

function categoryIdOf(category: Category): string {
  return category.id;
}

export function CategoriesResults({ list, actions }: CategoriesResultsProps): JSX.Element {
  const columns: DataTableColumns<Category> = useMemo(
    (): DataTableColumns<Category> => buildCategoryColumns(actions),
    [actions],
  );

  if (list.loadError !== null) {
    return (
      <EmptyState
        icon={CircleAlert}
        title={CATEGORIES_MESSAGES.LOAD_FAILED}
        description={list.loadError}
      />
    );
  }

  const emptyState: JSX.Element = <EmptyState icon={Tags} title={CATEGORIES_MESSAGES.EMPTY} />;

  return (
    <div aria-busy={list.refreshing} className="transition-opacity aria-busy:opacity-60">
      <ResponsiveList
        cards={
          <CategoryCardList
            categories={list.categories}
            loading={list.loading}
            emptyState={emptyState}
            actions={actions}
          />
        }
        table={
          <DataTable
            label={CATEGORIES_MESSAGES.LIST}
            columns={columns}
            data={list.categories}
            getRowId={categoryIdOf}
            loading={list.loading}
            emptyState={emptyState}
          />
        }
      />
    </div>
  );
}
