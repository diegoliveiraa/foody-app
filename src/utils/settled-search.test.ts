import { describe, expect, it } from "vitest";
import { settledSearchToApply, type SearchState } from "./settled-search";

const NOTHING_APPLIED: SearchState = { search: "", appliedSearch: "" };

describe("settledSearchToApply", () => {
  it("applies the search once the debounced value caught up with what was typed", () => {
    const search: string | null = settledSearchToApply(
      { ...NOTHING_APPLIED, search: "ana" },
      "ana",
    );

    expect(search).toBe("ana");
  });

  it("applies the search without the spaces around it", () => {
    const search: string | null = settledSearchToApply(
      { ...NOTHING_APPLIED, search: " ana " },
      " ana ",
    );

    expect(search).toBe("ana");
  });

  it("applies nothing while the typed text is ahead of the debounced value", () => {
    const search: string | null = settledSearchToApply({ ...NOTHING_APPLIED, search: "ana" }, "an");

    expect(search).toBeNull();
  });

  it("applies nothing when the settled search is already applied, spaces aside", () => {
    const search: string | null = settledSearchToApply(
      { search: "ana ", appliedSearch: "ana" },
      "ana ",
    );

    expect(search).toBeNull();
  });

  it("applies nothing right after the search was cleared, while the old value settles", () => {
    const search: string | null = settledSearchToApply(NOTHING_APPLIED, "ana");

    expect(search).toBeNull();
  });
});
