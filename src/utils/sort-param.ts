import { SORT_PARAM_SEPARATOR, type SortDirection } from "@/constants/sorting";

export interface SortOrder {
  property: string;
  direction: SortDirection;
}

export function toSortParam({ property, direction }: SortOrder): string {
  return `${property}${SORT_PARAM_SEPARATOR}${direction}`;
}
