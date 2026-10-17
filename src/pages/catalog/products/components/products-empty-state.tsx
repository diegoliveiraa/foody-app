import { CircleAlert, PackageSearch } from "lucide-react";
import type { JSX } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PRODUCTS_MESSAGES } from "../constants/messages";

interface ProductsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function ProductsEmptyState({
  hasFilters,
  onClearFilters,
}: ProductsEmptyStateProps): JSX.Element {
  return (
    <EmptyState icon={PackageSearch} title={PRODUCTS_MESSAGES.EMPTY}>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          {PRODUCTS_MESSAGES.CLEAR_FILTERS}
        </Button>
      )}
    </EmptyState>
  );
}

export function ProductsLoadError({ detail }: { detail: string }): JSX.Element {
  return (
    <EmptyState icon={CircleAlert} title={PRODUCTS_MESSAGES.LOAD_FAILED} description={detail} />
  );
}
