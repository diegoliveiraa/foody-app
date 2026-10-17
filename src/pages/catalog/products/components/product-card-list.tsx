import type { JSX, ReactNode } from "react";
import type { Product } from "@/@types/catalog";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/format-date";
import { formatMoney } from "@/utils/format-money";
import { SKELETON_CARDS } from "../constants";
import { PRODUCT_STATUS_LABELS, PRODUCTS_MESSAGES } from "../constants/messages";
import type { ProductRowActions } from "../types";
import { ProductActionsMenu } from "./product-actions-menu";

interface ProductCardProps {
  product: Product;
  actions: ProductRowActions;
}

interface ProductCardListProps {
  products: readonly Product[];
  loading: boolean;
  emptyState: ReactNode;
  actions: ProductRowActions;
}

function ProductCard({ product, actions }: ProductCardProps): JSX.Element {
  return (
    <article
      aria-label={product.name}
      className="flex flex-col gap-2.5 rounded-2xl border bg-card p-4 shadow-xs"
    >
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-semibold break-words text-foreground">{product.name}</span>
          <span className="text-sm text-muted-foreground">{product.category.name}</span>
        </div>
        <div className="-mt-2 -mr-2 shrink-0">
          <ProductActionsMenu product={product} actions={actions} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-foreground">{formatMoney(product.price)}</span>
        <StatusBadge status={product.status} label={PRODUCT_STATUS_LABELS[product.status]} />
      </div>
      <span className="text-[13px] text-muted-foreground">
        {PRODUCTS_MESSAGES.CREATED_AT(formatDate(product.createdAt))}
      </span>
    </article>
  );
}

function SkeletonCards(): JSX.Element {
  return (
    <div aria-busy="true" aria-label={PRODUCTS_MESSAGES.LIST} className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_CARDS }, (_card: unknown, index: number): JSX.Element => (
        <div key={index} className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      ))}
    </div>
  );
}

export function ProductCardList({
  products,
  loading,
  emptyState,
  actions,
}: ProductCardListProps): JSX.Element {
  if (loading) {
    return <SkeletonCards />;
  }
  if (products.length === 0) {
    return <>{emptyState}</>;
  }
  return (
    <ul aria-label={PRODUCTS_MESSAGES.LIST} className="flex flex-col gap-3">
      {products.map((product: Product): JSX.Element => (
        <li key={product.id}>
          <ProductCard product={product} actions={actions} />
        </li>
      ))}
    </ul>
  );
}
