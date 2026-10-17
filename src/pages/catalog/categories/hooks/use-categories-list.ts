import { useMemo } from "react";
import type { Category } from "@/@types/catalog";
import { useListCategoriesQuery } from "@/services/catalog";
import { extractApiError } from "@/utils/api-error";
import { NO_CATEGORIES } from "../constants";
import type { CategoriesListModel } from "../types";

export function useCategoriesList(): CategoriesListModel {
  const { data, error, isLoading, isFetching } = useListCategoriesQuery();
  const loadError: string | null = useMemo(
    (): string | null => (error === undefined ? null : extractApiError(error).detail),
    [error],
  );
  const categories: readonly Category[] = data ?? NO_CATEGORIES;

  return {
    categories,
    loading: isLoading,
    refreshing: isFetching && !isLoading,
    loadError,
  };
}
