import { useMemo } from "react";
import type { Category } from "@/@types/catalog";
import { ALL_FILTER } from "@/constants/filters";
import { useListCategoriesQuery } from "@/services/catalog";
import { PRODUCTS_MESSAGES } from "../constants/messages";
import type { CategoryFilter } from "../filter/types";
import type { ProductCategoryOptions } from "../types";

const NO_CATEGORIES: readonly Category[] = [];

export function useProductCategories(): ProductCategoryOptions {
  const { data } = useListCategoriesQuery();
  const categories: readonly Category[] = data ?? NO_CATEGORIES;

  return useMemo(
    (): ProductCategoryOptions => ({
      categories,
      filterOptions: [ALL_FILTER, ...categories.map((category: Category): string => category.id)],
      filterLabels: Object.fromEntries<string>([
        [ALL_FILTER, PRODUCTS_MESSAGES.ALL_CATEGORIES],
        ...categories.map((category: Category): [CategoryFilter, string] => [
          category.id,
          category.name,
        ]),
      ]),
    }),
    [categories],
  );
}
