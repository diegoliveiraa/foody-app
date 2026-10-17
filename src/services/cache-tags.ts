export const CACHE_TAGS = {
  ME: "Me",
  USER: "User",
  MENU: "Menu",
  CATEGORY: "Category",
  PRODUCT: "Product",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const LIST_ID: string = "LIST";
