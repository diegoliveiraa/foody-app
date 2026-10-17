import { describe, expect, it } from "vitest";
import { TILE_TONES } from "../constants";
import { tileToneOf } from "./tile-tone";

const CATEGORY_IDS: readonly string[] = [
  "0199f2a0-0000-7000-8000-0000000000c1",
  "0199f2a0-0000-7000-8000-0000000000c2",
  "0199f2a0-0000-7000-8000-0000000000c3",
  "0199f2a0-0000-7000-8000-0000000000c4",
  "0199f2a0-0000-7000-8000-0000000000c5",
  "0199f2a0-0000-7000-8000-0000000000c6",
];

describe("tileToneOf", () => {
  it("gives a category the same warm tone every time", () => {
    const first: string = tileToneOf(CATEGORY_IDS[0] ?? "");

    expect(tileToneOf(CATEGORY_IDS[0] ?? "")).toBe(first);
  });

  it("always picks a tone from the fixed palette", () => {
    const tones: string[] = CATEGORY_IDS.map(tileToneOf);

    tones.forEach((tone: string): void => expect(TILE_TONES).toContain(tone));
  });

  it("spreads different categories over different tones", () => {
    const tones: Set<string> = new Set(CATEGORY_IDS.map(tileToneOf));

    expect(tones.size).toBeGreaterThan(1);
  });
});
