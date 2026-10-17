import { Plus } from "lucide-react";
import type { JSX } from "react";
import type { MeScreen } from "@/@types/me";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SCREEN_KEYS } from "@/constants/screens";
import { useMeScreen } from "@/hooks/use-me-screen";
import { CategoriesResults } from "./components/categories-results";
import { CategoryDialogs } from "./components/category-dialogs";
import { CategoryFormDialog } from "./components/category-form-dialog";
import { CATEGORIES_MESSAGES } from "./constants/messages";
import { useCategoriesList } from "./hooks/use-categories-list";
import { useCategoryActions } from "./hooks/use-category-actions";
import { useCategoryForm } from "./hooks/use-category-form";
import type { CategoriesListModel, CategoryActionsModel, CategoryFormModel } from "./types";

export function CategoriesScreen(): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.CATALOG_CATEGORIES);
  const list: CategoriesListModel = useCategoriesList();
  const form: CategoryFormModel = useCategoryForm(list.categories);
  const actions: CategoryActionsModel = useCategoryActions(form.openEdit);

  return (
    <>
      <PageHeader title={screen?.label}>
        {form.canCreate && (
          <Button onClick={form.openCreate} className="max-sm:w-11 max-sm:px-0">
            <Plus aria-hidden="true" />
            <span className="max-sm:sr-only">{CATEGORIES_MESSAGES.NEW}</span>
          </Button>
        )}
      </PageHeader>
      <section className="flex flex-1 flex-col gap-4 px-4 pb-8 md:px-8">
        <CategoriesResults list={list} actions={actions.row} />
      </section>
      <CategoryFormDialog model={form} />
      <CategoryDialogs actions={actions} />
    </>
  );
}
