export const PAGE_SIZES = [10, 25, 50, 100] as const;

export type PageSize = (typeof PAGE_SIZES)[number];

export const DEFAULT_PAGE_SIZE: PageSize = PAGE_SIZES[0];

export const FIRST_PAGE: number = 1;
