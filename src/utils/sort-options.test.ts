import { describe, expect, it } from "vitest";
import { NO_SORT_OPTION, sortOfOption, sortOptionValue, type SortOption } from "./sort-options";
import type { SortOrder } from "./sort-param";

const NEWEST: SortOrder = { property: "placedAt", direction: "desc" };

const LOWEST_TOTAL: SortOrder = { property: "total", direction: "asc" };

const OPTIONS: readonly SortOption[] = [
  { label: "Mais recentes", sort: NEWEST },
  { label: "Mais antigos", sort: { property: "placedAt", direction: "asc" } },
  { label: "Menor total", sort: LOWEST_TOTAL },
];

describe("sortOptionValue", () => {
  it("names the option that matches the property and the direction of the current sort", () => {
    const value: string = sortOptionValue(OPTIONS, LOWEST_TOTAL);

    expect(value).toBe("total,asc");
  });

  it("names no option when the current sort is not one of them", () => {
    const value: string = sortOptionValue(OPTIONS, { property: "total", direction: "desc" });

    expect(value).toBe(NO_SORT_OPTION);
  });
});

describe("sortOfOption", () => {
  it("turns the chosen option back into the sort sent to the API", () => {
    const sort: SortOrder | undefined = sortOfOption(OPTIONS, "placedAt,asc");

    expect(sort).toEqual({ property: "placedAt", direction: "asc" });
  });

  it("turns an unknown choice into no sort at all", () => {
    const sort: SortOrder | undefined = sortOfOption(OPTIONS, "customerName,asc");

    expect(sort).toBeUndefined();
  });
});
