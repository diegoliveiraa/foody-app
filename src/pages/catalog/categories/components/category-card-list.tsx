import type { JSX, ReactNode } from "react";
import type { Category } from "@/@types/catalog";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SKELETON_CARDS } from "../constants";
import { CATEGORIES_MESSAGES, CATEGORY_STATUS_LABELS } from "../constants/messages";
import type { CategoryRowActions } from "../types";
import { CategoryActionsMenu } from "./category-actions-menu";

interface CategoryCardProps {
  category: Category;
  actions: CategoryRowActions;
}

interface CategoryCardListProps {
  categories: readonly Category[];
  loading: boolean;
  emptyState: ReactNode;
  actions: CategoryRowActions;
}

function CategoryCard({ category, actions }: CategoryCardProps): JSX.Element {
  return (
    <article
      aria-label={category.name}
      className="flex flex-col gap-2.5 rounded-2xl border bg-card p-4 shadow-xs"
    >
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 font-semibold break-words text-foreground">
          {category.name}
        </span>
        <div className="-mt-2 -mr-2 shrink-0">
          <CategoryActionsMenu category={category} actions={actions} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <StatusBadge status={category.status} label={CATEGORY_STATUS_LABELS[category.status]} />
        <span>{CATEGORIES_MESSAGES.DISPLAY_ORDER_OF(category.displayOrder)}</span>
        <span>{CATEGORIES_MESSAGES.PRODUCT_COUNT(category.productCount)}</span>
      </div>
    </article>
  );
}

function SkeletonCards(): JSX.Element {
  return (
    <div aria-busy="true" aria-label={CATEGORIES_MESSAGES.LIST} className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_CARDS }, (_card: unknown, index: number): JSX.Element => (
        <div key={index} className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-48 max-w-full" />
        </div>
      ))}
    </div>
  );
}

export function CategoryCardList({
  categories,
  loading,
  emptyState,
  actions,
}: CategoryCardListProps): JSX.Element {
  if (loading) {
    return <SkeletonCards />;
  }
  if (categories.length === 0) {
    return <>{emptyState}</>;
  }
  return (
    <ul aria-label={CATEGORIES_MESSAGES.LIST} className="flex flex-col gap-3">
      {categories.map((category: Category): JSX.Element => (
        <li key={category.id}>
          <CategoryCard category={category} actions={actions} />
        </li>
      ))}
    </ul>
  );
}
