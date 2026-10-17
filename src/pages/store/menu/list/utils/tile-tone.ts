import { EMPTY_TEXT } from "@/constants/validation";
import { TILE_TONES } from "../constants";

const NO_CODE: number = 0;

const FIRST_INDEX: number = 0;

export function tileToneOf(categoryId: string): string {
  const hash: number = Array.from(categoryId).reduce(
    (sum: number, character: string): number =>
      sum + (character.codePointAt(FIRST_INDEX) ?? NO_CODE),
    NO_CODE,
  );
  return TILE_TONES[hash % TILE_TONES.length] ?? EMPTY_TEXT;
}
