import { describe, expect, it } from "vitest";
import type { ZodSafeParseResult } from "zod";
import type { CancellationReason } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";
import {
  CANCELLATION_FIELDS,
  cancellationSchema,
  DECISION_FIELDS,
  decisionSchema,
  type CancellationFormInput,
  type CancellationFormValues,
  type DecisionFormValues,
} from "./cancellation";

const CUSTOMER_REASONS: readonly CancellationReason[] = [
  "CHANGED_MIND",
  "ORDERED_BY_MISTAKE",
  "TAKING_TOO_LONG",
  "OTHER",
];

function parse(input: CancellationFormInput): ZodSafeParseResult<CancellationFormValues> {
  return cancellationSchema(CUSTOMER_REASONS).safeParse(input);
}

function messagesOf(result: ZodSafeParseResult<unknown>): Record<string, string> {
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue): [string, string] => [
      issue.path.join("."),
      issue.message,
    ]),
  );
}

describe("cancellation schema", () => {
  it("accepts one of the reasons offered, trimming the note", () => {
    const result: ZodSafeParseResult<CancellationFormValues> = parse({
      reason: "TAKING_TOO_LONG",
      note: "  Já faz uma hora ",
    });

    expect(result.data).toEqual({ reason: "TAKING_TOO_LONG", note: "Já faz uma hora" });
  });

  it("sends no note when it is left blank", () => {
    const result: ZodSafeParseResult<CancellationFormValues> = parse({
      reason: "CHANGED_MIND",
      note: "   ",
    });

    expect(result.data).toEqual({ reason: "CHANGED_MIND", note: undefined });
  });

  it("asks for a reason when none was chosen", () => {
    const result: ZodSafeParseResult<CancellationFormValues> = parse({ reason: "", note: "" });

    expect(messagesOf(result)).toEqual({
      reason: MESSAGES.VALIDATION.CANCELLATION_REASON_REQUIRED,
    });
  });

  it("rejects a reason the order does not offer now", () => {
    const result: ZodSafeParseResult<CancellationFormValues> = parse({
      reason: "STORE_CLOSED",
      note: "",
    });

    expect(messagesOf(result)).toEqual({
      reason: MESSAGES.VALIDATION.CANCELLATION_REASON_REQUIRED,
    });
  });

  it("asks for the note when the reason is another one, as the API does", () => {
    const blank: ZodSafeParseResult<CancellationFormValues> = parse({
      reason: "OTHER",
      note: "  ",
    });
    const told: ZodSafeParseResult<CancellationFormValues> = parse({
      reason: "OTHER",
      note: "Vou sair de casa",
    });

    expect(messagesOf(blank)).toEqual({ note: MESSAGES.VALIDATION.CANCELLATION_NOTE_REQUIRED });
    expect(told.data).toEqual({ reason: "OTHER", note: "Vou sair de casa" });
  });

  it("takes a note of up to 300 characters", () => {
    const longest: ZodSafeParseResult<CancellationFormValues> = parse({
      reason: "CHANGED_MIND",
      note: "a".repeat(300),
    });
    const tooLong: ZodSafeParseResult<CancellationFormValues> = parse({
      reason: "CHANGED_MIND",
      note: "a".repeat(301),
    });

    expect(longest.success).toBe(true);
    expect(messagesOf(tooLong)).toEqual({ note: MESSAGES.VALIDATION.CANCELLATION_NOTE_TOO_LONG });
  });

  it("offers nothing to choose when the order can no longer be cancelled", () => {
    const result: ZodSafeParseResult<CancellationFormValues> = cancellationSchema([]).safeParse({
      reason: "CHANGED_MIND",
      note: "",
    });

    expect(result.success).toBe(false);
  });

  it("names its fields the way the API reports their errors", () => {
    expect(CANCELLATION_FIELDS).toEqual(["reason", "note"]);
    expect(DECISION_FIELDS).toEqual(["note"]);
  });
});

describe("cancellation decision schema", () => {
  it("takes an optional note for the customer, trimmed, and none when blank", () => {
    const told: ZodSafeParseResult<DecisionFormValues> = decisionSchema.safeParse({
      note: " Já saiu da cozinha ",
    });
    const blank: ZodSafeParseResult<DecisionFormValues> = decisionSchema.safeParse({ note: " " });

    expect(told.data).toEqual({ note: "Já saiu da cozinha" });
    expect(blank.data).toEqual({ note: undefined });
  });

  it("takes a note of up to 300 characters", () => {
    const tooLong: ZodSafeParseResult<DecisionFormValues> = decisionSchema.safeParse({
      note: "a".repeat(301),
    });

    expect(messagesOf(tooLong)).toEqual({ note: MESSAGES.VALIDATION.CANCELLATION_NOTE_TOO_LONG });
  });
});
