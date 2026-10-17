import { describe, expect, it } from "vitest";
import type { ZodSafeParseResult } from "zod";
import { MESSAGES } from "@/constants/messages";
import {
  CHECKOUT_FIELDS,
  checkoutSchema,
  type CheckoutFormInput,
  type CheckoutFormValues,
} from "./delivery-address";

type AddressInput = CheckoutFormInput["deliveryAddress"];

const PAULISTA: AddressInput = {
  zipCode: "01310-100",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
};

function parse(changes: Partial<AddressInput>): ZodSafeParseResult<CheckoutFormValues> {
  return checkoutSchema.safeParse({ deliveryAddress: { ...PAULISTA, ...changes } });
}

function messagesOf(result: ZodSafeParseResult<CheckoutFormValues>): Record<string, string> {
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue): [string, string] => [
      issue.path.join("."),
      issue.message,
    ]),
  );
}

describe("delivery address schema", () => {
  it("accepts a complete address as typed", () => {
    const result: ZodSafeParseResult<CheckoutFormValues> = parse({});

    expect(result.data).toEqual({ deliveryAddress: PAULISTA });
  });

  it("writes a CEP typed without the hyphen as 00000-000", () => {
    const result: ZodSafeParseResult<CheckoutFormValues> = parse({ zipCode: "01310100" });

    expect(result.data?.deliveryAddress.zipCode).toBe("01310-100");
  });

  it("rejects a CEP that is not eight digits", () => {
    const short: ZodSafeParseResult<CheckoutFormValues> = parse({ zipCode: "0131-100" });
    const long: ZodSafeParseResult<CheckoutFormValues> = parse({ zipCode: "01310-1000" });
    const letters: ZodSafeParseResult<CheckoutFormValues> = parse({ zipCode: "01310-1AB" });

    expect(messagesOf(short)).toEqual({
      "deliveryAddress.zipCode": MESSAGES.VALIDATION.ZIP_CODE_INVALID,
    });
    expect(long.success).toBe(false);
    expect(letters.success).toBe(false);
  });

  it("trims every field and sends a blank complement as null", () => {
    const result: ZodSafeParseResult<CheckoutFormValues> = parse({
      street: "  Avenida Paulista ",
      number: " 1000 ",
      complement: "   ",
      city: " São Paulo ",
    });

    expect(result.data?.deliveryAddress).toEqual({
      ...PAULISTA,
      complement: null,
    });
  });

  it("takes a street of 2 to 120 characters", () => {
    const tooShort: ZodSafeParseResult<CheckoutFormValues> = parse({ street: "A" });
    const shortest: ZodSafeParseResult<CheckoutFormValues> = parse({ street: "Av" });
    const longest: ZodSafeParseResult<CheckoutFormValues> = parse({ street: "a".repeat(120) });
    const tooLong: ZodSafeParseResult<CheckoutFormValues> = parse({ street: "a".repeat(121) });

    expect(messagesOf(tooShort)).toEqual({
      "deliveryAddress.street": MESSAGES.VALIDATION.STREET_LENGTH,
    });
    expect(shortest.success).toBe(true);
    expect(longest.success).toBe(true);
    expect(tooLong.success).toBe(false);
  });

  it("takes a number of 1 to 10 characters", () => {
    const empty: ZodSafeParseResult<CheckoutFormValues> = parse({ number: " " });
    const longest: ZodSafeParseResult<CheckoutFormValues> = parse({ number: "1".repeat(10) });
    const tooLong: ZodSafeParseResult<CheckoutFormValues> = parse({ number: "1".repeat(11) });

    expect(messagesOf(empty)).toEqual({
      "deliveryAddress.number": MESSAGES.VALIDATION.ADDRESS_NUMBER_LENGTH,
    });
    expect(longest.success).toBe(true);
    expect(tooLong.success).toBe(false);
  });

  it("takes a complement of up to 60 characters", () => {
    const longest: ZodSafeParseResult<CheckoutFormValues> = parse({ complement: "a".repeat(60) });
    const tooLong: ZodSafeParseResult<CheckoutFormValues> = parse({ complement: "a".repeat(61) });

    expect(longest.success).toBe(true);
    expect(messagesOf(tooLong)).toEqual({
      "deliveryAddress.complement": MESSAGES.VALIDATION.COMPLEMENT_TOO_LONG,
    });
  });

  it("takes a neighborhood and a city of 2 to 60 characters", () => {
    const result: ZodSafeParseResult<CheckoutFormValues> = parse({
      neighborhood: "B",
      city: "a".repeat(61),
    });
    const longest: ZodSafeParseResult<CheckoutFormValues> = parse({
      neighborhood: "a".repeat(60),
      city: "a".repeat(60),
    });

    expect(messagesOf(result)).toEqual({
      "deliveryAddress.neighborhood": MESSAGES.VALIDATION.NEIGHBORHOOD_LENGTH,
      "deliveryAddress.city": MESSAGES.VALIDATION.CITY_LENGTH,
    });
    expect(longest.success).toBe(true);
  });

  it("asks for one of the 27 states", () => {
    const missing: ZodSafeParseResult<CheckoutFormValues> = parse({ state: "" });
    const unknown: ZodSafeParseResult<CheckoutFormValues> = parse({ state: "XX" });
    const federalDistrict: ZodSafeParseResult<CheckoutFormValues> = parse({ state: "DF" });

    expect(messagesOf(missing)).toEqual({
      "deliveryAddress.state": MESSAGES.VALIDATION.STATE_REQUIRED,
    });
    expect(unknown.success).toBe(false);
    expect(federalDistrict.success).toBe(true);
  });

  it("names each field the way the API reports its errors", () => {
    expect(CHECKOUT_FIELDS).toEqual([
      "deliveryAddress.zipCode",
      "deliveryAddress.street",
      "deliveryAddress.number",
      "deliveryAddress.complement",
      "deliveryAddress.neighborhood",
      "deliveryAddress.city",
      "deliveryAddress.state",
    ]);
  });
});
