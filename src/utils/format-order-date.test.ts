import { describe, expect, it } from "vitest";
import {
  formatClock,
  formatOrderAge,
  formatOrderTime,
  formatUpdatedAgo,
} from "./format-order-date";

const NOW: number = new Date(2026, 9, 17, 19, 30, 0).getTime();

const SECOND_MS: number = 1_000;

const MINUTE_MS: number = 60 * SECOND_MS;

function localInstant(month: number, day: number, hour: number, minute: number): string {
  return new Date(2026, month, day, hour, minute).toISOString();
}

function msAgo(elapsedMs: number): string {
  return new Date(NOW - elapsedMs).toISOString();
}

describe("formatClock", () => {
  it("shows the local hour and minute of an instant", () => {
    const shown: string = formatClock(localInstant(9, 17, 9, 5));

    expect(shown).toBe("09:05");
  });
});

describe("formatOrderTime", () => {
  it("calls an order placed today 'Hoje' with its time", () => {
    const shown: string = formatOrderTime(localInstant(9, 17, 19, 2), NOW);

    expect(shown).toBe("Hoje, 19:02");
  });

  it("still calls an order placed right after midnight 'Hoje'", () => {
    const shown: string = formatOrderTime(localInstant(9, 17, 0, 1), NOW);

    expect(shown).toBe("Hoje, 00:01");
  });

  it("calls an order placed the day before 'Ontem', up to its last minute", () => {
    const evening: string = formatOrderTime(localInstant(9, 16, 20, 14), NOW);
    const lastMinute: string = formatOrderTime(localInstant(9, 16, 23, 59), NOW);

    expect(evening).toBe("Ontem, 20:14");
    expect(lastMinute).toBe("Ontem, 23:59");
  });

  it("shows day and month for an older order of the same year", () => {
    const shown: string = formatOrderTime(localInstant(9, 10, 13, 5), NOW);

    expect(shown).toBe("10/10, 13:05");
  });

  it("adds the year to an order from another year", () => {
    const shown: string = formatOrderTime(new Date(2025, 9, 10, 13, 5).toISOString(), NOW);

    expect(shown).toBe("10/10/2025, 13:05");
  });
});

describe("formatOrderAge", () => {
  it("says 'agora' during the first minute", () => {
    const shown: string = formatOrderAge(msAgo(59 * SECOND_MS), NOW);

    expect(shown).toBe("agora");
  });

  it("says 'agora' for an instant slightly ahead of the device clock", () => {
    const shown: string = formatOrderAge(msAgo(-5 * SECOND_MS), NOW);

    expect(shown).toBe("agora");
  });

  it("counts whole minutes once the first one has passed", () => {
    const oneMinute: string = formatOrderAge(msAgo(MINUTE_MS), NOW);
    const almostThirteen: string = formatOrderAge(msAgo(13 * MINUTE_MS - SECOND_MS), NOW);

    expect(oneMinute).toBe("há 1 min");
    expect(almostThirteen).toBe("há 12 min");
  });

  it("counts hours, and the minutes beyond them, from one hour on", () => {
    const oneHour: string = formatOrderAge(msAgo(60 * MINUTE_MS), NOW);
    const longer: string = formatOrderAge(msAgo(95 * MINUTE_MS), NOW);

    expect(oneHour).toBe("há 1 h");
    expect(longer).toBe("há 1 h 35 min");
  });
});

describe("formatUpdatedAgo", () => {
  it("counts the seconds since the last update", () => {
    const shown: string = formatUpdatedAgo(NOW - 12 * SECOND_MS, NOW);

    expect(shown).toBe("Atualizado há 12 s");
  });

  it("never counts below zero seconds", () => {
    const shown: string = formatUpdatedAgo(NOW + 2 * SECOND_MS, NOW);

    expect(shown).toBe("Atualizado há 0 s");
  });

  it("switches to minutes once a minute has passed", () => {
    const shown: string = formatUpdatedAgo(NOW - 150 * SECOND_MS, NOW);

    expect(shown).toBe("Atualizado há 2 min");
  });
});
