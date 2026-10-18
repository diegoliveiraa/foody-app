import { describe, expect, it } from "vitest";
import type { DashboardPeriod } from "@/@types/dashboard";
import { parsePeriod } from "./period-param";

describe("parsePeriod", () => {
  it("reads a period the API knows from the address", () => {
    const period: DashboardPeriod = parsePeriod("LAST_30_DAYS");

    expect(period).toBe("LAST_30_DAYS");
  });

  it("starts on today when the address names no period", () => {
    const period: DashboardPeriod = parsePeriod(null);

    expect(period).toBe("TODAY");
  });

  it("falls back to today when the address names a period the API does not know", () => {
    const slug: DashboardPeriod = parsePeriod("hoje");
    const lowerCase: DashboardPeriod = parsePeriod("last_7_days");

    expect(slug).toBe("TODAY");
    expect(lowerCase).toBe("TODAY");
  });
});
