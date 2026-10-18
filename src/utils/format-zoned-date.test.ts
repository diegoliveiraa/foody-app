import { describe, expect, it } from "vitest";
import {
  formatZonedClock,
  formatZonedDayMonth,
  formatZonedHour,
  formatZonedWeekday,
} from "./format-zoned-date";

const SAO_PAULO: string = "America/Sao_Paulo";

const TOKYO: string = "Asia/Tokyo";

describe("formatZonedClock", () => {
  it("shows the hour and minute of an instant in the given time zone", () => {
    const shown: string = formatZonedClock("2026-10-17T22:42:00Z", SAO_PAULO);

    expect(shown).toBe("19:42");
  });

  it("pads the hour and follows another zone the same way", () => {
    const shown: string = formatZonedClock("2026-10-17T22:05:00Z", TOKYO);

    expect(shown).toBe("07:05");
  });
});

describe("formatZonedHour", () => {
  it("names the hour of an instant in the given time zone, without padding", () => {
    const morning: string = formatZonedHour("2026-10-17T12:00:00Z", SAO_PAULO);
    const evening: string = formatZonedHour("2026-10-17T22:00:00Z", SAO_PAULO);

    expect(morning).toBe("9h");
    expect(evening).toBe("19h");
  });

  it("calls local midnight 0h", () => {
    const shown: string = formatZonedHour("2026-10-17T03:00:00Z", SAO_PAULO);

    expect(shown).toBe("0h");
  });
});

describe("formatZonedWeekday", () => {
  it("names the short weekday of the local day", () => {
    const shown: string = formatZonedWeekday("2026-10-16T03:00:00Z", SAO_PAULO);

    expect(shown).toBe("sex");
  });

  it("uses the local day even when the instant is already the next day in UTC", () => {
    const saturdayInUtc: string = formatZonedWeekday("2026-10-17T02:30:00Z", SAO_PAULO);
    const saturdayInTokyo: string = formatZonedWeekday("2026-10-17T02:30:00Z", TOKYO);

    expect(saturdayInUtc).toBe("sex");
    expect(saturdayInTokyo).toBe("sáb");
  });
});

describe("formatZonedDayMonth", () => {
  it("shows the local day and month, padded", () => {
    const shown: string = formatZonedDayMonth("2026-10-01T03:00:00Z", SAO_PAULO);

    expect(shown).toBe("01/10");
  });

  it("uses the local day near midnight", () => {
    const shown: string = formatZonedDayMonth("2026-10-17T02:30:00Z", SAO_PAULO);

    expect(shown).toBe("16/10");
  });
});
