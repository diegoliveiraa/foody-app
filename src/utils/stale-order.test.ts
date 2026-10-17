import { describe, expect, it } from "vitest";
import { problem } from "@/test/problems";
import { isStaleOrderError } from "./stale-order";

const STALE_CODES: readonly [number, string][] = [
  [422, "INVALID_STATUS_TRANSITION"],
  [422, "CANCELLATION_NOT_ALLOWED"],
  [422, "INVALID_CANCELLATION_REASON"],
  [422, "PENDING_CANCELLATION_REQUEST"],
  [422, "CANCELLATION_ALREADY_REQUESTED"],
  [422, "NO_PENDING_CANCELLATION_REQUEST"],
  [409, "CONCURRENT_UPDATE"],
];

describe("isStaleOrderError", () => {
  it.each(STALE_CODES)(
    "treats a %i %s as a screen showing an outdated order",
    (status: number, code: string) => {
      expect(isStaleOrderError({ status, data: problem(status, code) })).toBe(true);
    },
  );

  it("leaves a field error, a rate limit and an unreachable server to their own handling", () => {
    const fieldError: unknown = { status: 400, data: problem(400, "VALIDATION_FAILED") };
    const rateLimited: unknown = { status: 429, data: problem(429, "RATE_LIMITED") };
    const unreachable: unknown = { status: "FETCH_ERROR", error: "Failed to fetch" };

    expect([fieldError, rateLimited, unreachable].map(isStaleOrderError)).toEqual([
      false,
      false,
      false,
    ]);
  });
});
