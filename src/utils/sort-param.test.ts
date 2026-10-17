import { describe, expect, it } from "vitest";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { toSortParam } from "./sort-param";

describe("toSortParam", () => {
  it("writes an ascending sort as property,asc", () => {
    const param: string = toSortParam({ property: "name", direction: SORT_DIRECTIONS.ASC });

    expect(param).toBe("name,asc");
  });

  it("writes a descending sort as property,desc", () => {
    const param: string = toSortParam({ property: "createdAt", direction: SORT_DIRECTIONS.DESC });

    expect(param).toBe("createdAt,desc");
  });
});
