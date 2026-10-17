import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("shows an instant as day/month/year", () => {
    const shown: string = formatDate("2026-03-04T15:00:00Z");

    expect(shown).toBe("04/03/2026");
  });

  it("keeps two-digit days and months at the end of the year", () => {
    const shown: string = formatDate("2025-12-31T12:00:00Z");

    expect(shown).toBe("31/12/2025");
  });
});
