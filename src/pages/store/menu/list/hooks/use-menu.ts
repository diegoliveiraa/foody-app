import { useMemo } from "react";
import type { MenuCategory } from "@/@types/menu";
import { ALL_FILTER } from "@/constants/filters";
import { useGetMenuQuery } from "@/services/menu";
import { extractApiError } from "@/utils/api-error";
import { NO_MENU_CATEGORIES } from "../constants";
import { MENU_MESSAGES } from "../constants/messages";
import { useMenuFilter } from "../filter/hooks/use-menu-filter";
import type { MenuFilterModel } from "../filter/types";
import type { CategoryChip, MenuModel } from "../types";
import { productNamesOf } from "../utils/bag-lines";
import { filterMenu } from "../utils/filter-menu";

const ALL_CHIP: CategoryChip = { id: ALL_FILTER, label: MENU_MESSAGES.ALL_CATEGORIES };

export function useMenu(): MenuModel {
  const { filter, actions }: MenuFilterModel = useMenuFilter();
  const { data, error, isLoading } = useGetMenuQuery();
  const categories: readonly MenuCategory[] = data?.categories ?? NO_MENU_CATEGORIES;
  const sections: readonly MenuCategory[] = useMemo(
    (): MenuCategory[] => filterMenu(categories, filter),
    [categories, filter],
  );
  const chips: readonly CategoryChip[] = useMemo(
    (): CategoryChip[] => [
      ALL_CHIP,
      ...categories.map((category: MenuCategory): CategoryChip => ({
        id: category.id,
        label: category.name,
      })),
    ],
    [categories],
  );
  const productNames: ReadonlyMap<string, string> = useMemo(
    (): ReadonlyMap<string, string> => productNamesOf(categories),
    [categories],
  );
  const loadError: string | null = useMemo(
    (): string | null => (error === undefined ? null : extractApiError(error).detail),
    [error],
  );

  return {
    filter,
    actions,
    categories,
    sections,
    chips,
    productNames,
    loading: isLoading,
    loadError,
  };
}
