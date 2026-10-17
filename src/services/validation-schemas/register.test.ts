import { describe, expect, it } from "vitest";
import type { ZodIssue, ZodSafeParseResult } from "zod";
import { MESSAGES } from "@/constants/messages";
import { registerSchema, type RegisterValues } from "./register";

const VALID: RegisterValues = {
  name: "Ana Souza",
  email: "ana@foody.dev",
  password: "senha-forte",
};

function errorsOf(values: RegisterValues): Record<string, string | undefined> {
  const result: ZodSafeParseResult<RegisterValues> = registerSchema.safeParse(values);
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue: ZodIssue): [string, string] => [
      issue.path.join("."),
      issue.message,
    ]),
  );
}

describe("register schema", () => {
  it("accepts a valid sign-up and trims the name and e-mail", () => {
    const result: ZodSafeParseResult<RegisterValues> = registerSchema.safeParse({
      ...VALID,
      name: "  Ana  ",
      email: " ana@foody.dev ",
    });

    expect(result.data).toEqual({ ...VALID, name: "Ana", email: "ana@foody.dev" });
  });

  it("rejects a name shorter than 2 characters once trimmed", () => {
    const errors: Record<string, string | undefined> = errorsOf({ ...VALID, name: " A " });

    expect(errors.name).toBe(MESSAGES.VALIDATION.NAME_LENGTH);
  });

  it("rejects an invalid e-mail", () => {
    const errors: Record<string, string | undefined> = errorsOf({ ...VALID, email: "ana@" });

    expect(errors.email).toBe(MESSAGES.VALIDATION.EMAIL_INVALID);
  });

  it("rejects an e-mail longer than 254 characters", () => {
    const errors: Record<string, string | undefined> = errorsOf({
      ...VALID,
      email: `${"a".repeat(250)}@x.dev`,
    });

    expect(errors.email).toBe(MESSAGES.VALIDATION.EMAIL_TOO_LONG);
  });

  it("rejects a password shorter than 8 characters", () => {
    const errors: Record<string, string | undefined> = errorsOf({ ...VALID, password: "curta" });

    expect(errors.password).toBe(MESSAGES.VALIDATION.PASSWORD_TOO_SHORT);
  });

  it("rejects a password over 72 bytes even with fewer than 72 characters", () => {
    const errors: Record<string, string | undefined> = errorsOf({
      ...VALID,
      password: "é".repeat(37),
    });

    expect(errors.password).toBe(MESSAGES.VALIDATION.PASSWORD_TOO_LONG);
  });

  it("accepts a password of exactly 72 bytes", () => {
    const errors: Record<string, string | undefined> = errorsOf({
      ...VALID,
      password: "é".repeat(36),
    });

    expect(errors.password).toBeUndefined();
  });
});
