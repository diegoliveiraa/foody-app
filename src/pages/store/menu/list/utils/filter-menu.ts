import type { MenuCategory, MenuProduct } from "@/@types/menu";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { APP_LOCALE } from "@/constants/locale";
import type { MenuFilterState } from "../filter/types";

const DECOMPOSED_FORM: string = "NFD";

const DIACRITICS: RegExp = /\p{Diacritic}/gu;

function normalized(text: string): string {
  return text
    .normalize(DECOMPOSED_FORM)
    .replace(DIACRITICS, EMPTY_SEARCH)
    .toLocaleLowerCase(APP_LOCALE)
    .trim();
}

function mentions(text: string | null | undefined, wanted: string): boolean {
  return typeof text === "string" && normalized(text).includes(wanted);
}

function productMentions(product: MenuProduct, wanted: string): boolean {
  return mentions(product.name, wanted) || mentions(product.description, wanted);
}

function withProductsMatching(category: MenuCategory, wanted: string): MenuCategory {
  if (wanted === EMPTY_SEARCH || mentions(category.name, wanted)) {
    return category;
  }
  return {
    ...category,
    products: category.products.filter((product: MenuProduct): boolean =>
      productMentions(product, wanted),
    ),
  };
}

export function filterMenu(
  categories: readonly MenuCategory[],
  { search, categoryId }: MenuFilterState,
): MenuCategory[] {
  const wanted: string = normalized(search);
  return categories
    .filter(
      (category: MenuCategory): boolean => categoryId === ALL_FILTER || category.id === categoryId,
    )
    .map((category: MenuCategory): MenuCategory => withProductsMatching(category, wanted))
    .filter((category: MenuCategory): boolean => category.products.length > 0);
}
