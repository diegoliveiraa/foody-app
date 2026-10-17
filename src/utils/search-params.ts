type SearchParamEntry = [string, string];

function entriesOf(name: string, value: unknown): SearchParamEntry[] {
  if (value === undefined || value === null) {
    return [];
  }
  const values: unknown[] = Array.isArray(value) ? value : [value];
  return values.map((item: unknown): SearchParamEntry => [name, String(item)]);
}

export function serializeSearchParams(params: Record<string, unknown>): string {
  const entries: SearchParamEntry[] = Object.entries(params).flatMap(
    ([name, value]: [string, unknown]): SearchParamEntry[] => entriesOf(name, value),
  );
  return new URLSearchParams(entries).toString();
}
