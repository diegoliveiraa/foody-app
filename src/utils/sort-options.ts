import { toSortParam, type SortOrder } from "./sort-param";

export interface SortOption {
  label: string;
  sort: SortOrder;
}

export const NO_SORT_OPTION: string = "";

function optionWithValue(options: readonly SortOption[], value: string): SortOption | undefined {
  return options.find((option: SortOption): boolean => toSortParam(option.sort) === value);
}

export function sortOptionValue(options: readonly SortOption[], sort: SortOrder): string {
  const value: string = toSortParam(sort);
  return optionWithValue(options, value) === undefined ? NO_SORT_OPTION : value;
}

export function sortOfOption(options: readonly SortOption[], value: string): SortOrder | undefined {
  return optionWithValue(options, value)?.sort;
}
