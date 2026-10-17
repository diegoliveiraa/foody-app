import { describe, expect, it } from "vitest";
import type { ZodIssue, ZodSafeParseResult } from "zod";
import { MESSAGES } from "@/constants/messages";
import { productSchema, type ProductFormInput, type ProductFormValues } from "./product";

const VALID: ProductFormInput = {
  name: "Smash duplo",
  description: "Dois blends de 90 g, cheddar e cebola caramelizada.",
  price: "34,90",
  categoryId: "0199f2a0-0000-7000-8000-0000000000c1",
};

function parse(values: Partial<ProductFormInput>): ZodSafeParseResult<ProductFormValues> {
  return productSchema.safeParse({ ...VALID, ...values });
}

function priceOf(price: string): number | undefined {
  return parse({ price }).data?.price;
}

function errorsOf(values: Partial<ProductFormInput>): Record<string, string> {
  return Object.fromEntries(
    (parse(values).error?.issues ?? []).map((issue: ZodIssue): [string, string] => [
      issue.path.join("."),
      issue.message,
    ]),
  );
}

describe("product schema — price typed in Brazilian format", () => {
  it("reads a comma as the decimal separator", () => {
    expect(priceOf("34,90")).toBe(34.9);
  });

  it("also accepts a dot as the decimal separator", () => {
    expect(priceOf("34.90")).toBe(34.9);
  });

  it("accepts whole amounts and a single decimal, ignoring spaces around", () => {
    expect(priceOf("12")).toBe(12);
    expect(priceOf("7,5")).toBe(7.5);
    expect(priceOf(" 18,90 ")).toBe(18.9);
  });

  it("asks for a price when the field is empty", () => {
    expect(errorsOf({ price: "  " }).price).toBe(MESSAGES.VALIDATION.PRICE_REQUIRED);
  });

  it("rejects text, more than two decimals and thousands separators", () => {
    expect(errorsOf({ price: "abc" }).price).toBe(MESSAGES.VALIDATION.PRICE_INVALID);
    expect(errorsOf({ price: "34,999" }).price).toBe(MESSAGES.VALIDATION.PRICE_INVALID);
    expect(errorsOf({ price: "1.234,56" }).price).toBe(MESSAGES.VALIDATION.PRICE_INVALID);
    expect(errorsOf({ price: "-5" }).price).toBe(MESSAGES.VALIDATION.PRICE_INVALID);
  });

  it("rejects a price of zero", () => {
    expect(errorsOf({ price: "0,00" }).price).toBe(MESSAGES.VALIDATION.PRICE_POSITIVE);
  });

  it("accepts up to R$ 9.999,99 and rejects more", () => {
    expect(priceOf("9999,99")).toBe(9999.99);
    expect(errorsOf({ price: "10000" }).price).toBe(MESSAGES.VALIDATION.PRICE_TOO_HIGH);
  });
});

describe("product schema — other fields", () => {
  it("trims the name and description", () => {
    const values: ProductFormValues | undefined = parse({
      name: "  Smash duplo ",
      description: " Pão brioche ",
    }).data;

    expect(values).toMatchObject({ name: "Smash duplo", description: "Pão brioche" });
  });

  it("sends no description when it is left blank", () => {
    expect(parse({ description: "   " }).data?.description).toBeNull();
  });

  it("accepts names from 2 to 80 characters", () => {
    expect(errorsOf({ name: " A " }).name).toBe(MESSAGES.VALIDATION.PRODUCT_NAME_LENGTH);
    expect(errorsOf({ name: "a".repeat(81) }).name).toBe(MESSAGES.VALIDATION.PRODUCT_NAME_LENGTH);
    expect(errorsOf({ name: "a".repeat(80) }).name).toBeUndefined();
  });

  it("accepts a description of up to 300 characters", () => {
    expect(errorsOf({ description: "a".repeat(300) }).description).toBeUndefined();
    expect(errorsOf({ description: "a".repeat(301) }).description).toBe(
      MESSAGES.VALIDATION.DESCRIPTION_TOO_LONG,
    );
  });

  it("asks for a category", () => {
    expect(errorsOf({ categoryId: "" }).categoryId).toBe(MESSAGES.VALIDATION.CATEGORY_REQUIRED);
  });
});
