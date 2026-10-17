export interface SearchState {
  search: string;
  appliedSearch: string;
}

export function settledSearchToApply(
  { search, appliedSearch }: SearchState,
  settled: string,
): string | null {
  const trimmed: string = settled.trim();
  return settled === search && trimmed !== appliedSearch ? trimmed : null;
}
