import { describe, expect, it } from "vitest";
import type { StaffOrderSummary } from "@/@types/orders";
import { staffSummary } from "@/test/orders";
import type { PendingRequests } from "../types";
import { pendingRequestsOf } from "./pending-requests";

function pending(number: number, placedAt: string): StaffOrderSummary {
  return staffSummary(number, {
    status: "PREPARING",
    placedAt,
    hasPendingCancellationRequest: true,
    allowedTransitions: [],
    canCancel: false,
    cancellationReasons: [],
  });
}

describe("pendingRequestsOf", () => {
  it("counts the orders whose customer asked to cancel and points to the oldest", () => {
    const newer: StaffOrderSummary = pending(1044, "2026-10-17T22:20:00Z");
    const older: StaffOrderSummary = pending(1041, "2026-10-17T22:02:00Z");

    const requests: PendingRequests | null = pendingRequestsOf([
      staffSummary(1045),
      newer,
      staffSummary(1043, { status: "PREPARING" }),
      older,
    ]);

    expect(requests).toEqual({ count: 2, oldest: older });
  });

  it("finds nothing when no customer is waiting for an answer", () => {
    const requests: PendingRequests | null = pendingRequestsOf([
      staffSummary(1045),
      staffSummary(1043, { status: "PREPARING" }),
    ]);

    expect(requests).toBeNull();
  });
});
