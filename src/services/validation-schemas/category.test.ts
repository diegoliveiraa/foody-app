import { describe, expect, it } from "vitest";
import type { ZodIssue, ZodSafeParseResult } from "zod";
import { MESSAGES } from "@/constants/messages";
import { categorySchema, type CategoryFormInput, type CategoryFormValues } from "./category";

const VALID: CategoryFormInput = { name: "Lanches", displayOrder: "1" };

function parse(values: Partial<CategoryFormInput>): ZodSafeParseResult<CategoryFormValues> {
  return categorySchema.safeParse({ ...VALID, ...values });
}

function errorsOf(values: Partial<CategoryFormInput>): Record<string, string> {
  return Object.fromEntries(
    (parse(values).error?.issues ?? []).map((issue: ZodIssue): [string, string] => [
      issue.path.join("."),
      issue.message,
    ]),
  );
}

describe("category schema", () => {
  it("trims the name and reads the display order as a whole number", () => {
    expect(parse({ name: " Pizzas ", displayOrder: " 12 " }).data).toEqual({
      name: "Pizzas",
      displayOrder: 12,
    });
  });

  it("accepts names from 2 to 60 characters", () => {
    expect(errorsOf({ name: "P" }).name).toBe(MESSAGES.VALIDATION.CATEGORY_NAME_LENGTH);
    expect(errorsOf({ name: "a".repeat(61) }).name).toBe(MESSAGES.VALIDATION.CATEGORY_NAME_LENGTH);
    expect(errorsOf({ name: "a".repeat(60) }).name).toBeUndefined();
  });

  it("accepts a display order from 0 to 999", () => {
    expect(parse({ displayOrder: "0" }).data?.displayOrder).toBe(0);
    expect(parse({ displayOrder: "999" }).data?.displayOrder).toBe(999);
    expect(errorsOf({ displayOrder: "1000" }).displayOrder).toBe(
      MESSAGES.VALIDATION.DISPLAY_ORDER_RANGE,
    );
  });

  it("rejects an empty, negative or fractional display order", () => {
    expect(errorsOf({ displayOrder: "" }).displayOrder).toBe(
      MESSAGES.VALIDATION.DISPLAY_ORDER_RANGE,
    );
    expect(errorsOf({ displayOrder: "-1" }).displayOrder).toBe(
      MESSAGES.VALIDATION.DISPLAY_ORDER_RANGE,
    );
    expect(errorsOf({ displayOrder: "1,5" }).displayOrder).toBe(
      MESSAGES.VALIDATION.DISPLAY_ORDER_RANGE,
    );
  });
});
