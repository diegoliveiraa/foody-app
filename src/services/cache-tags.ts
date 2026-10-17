export const CACHE_TAGS = {
  ME: "Me",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const LIST_ID: string = "LIST";
