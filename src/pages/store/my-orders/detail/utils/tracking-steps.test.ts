import { describe, expect, it } from "vitest";
import type { CustomerOrderHistoryEntry } from "@/@types/orders";
import type { TrackingStep } from "../types";
import { toTrackingSteps } from "./tracking-steps";

const RECEIVED_AT: string = "2026-10-17T22:02:00Z";

const PREPARING_AT: string = "2026-10-17T22:05:00Z";

const CREATED: CustomerOrderHistoryEntry = {
  fromStatus: null,
  toStatus: "RECEIVED",
  actorSide: "CUSTOMER",
  occurredAt: RECEIVED_AT,
};

const STARTED: CustomerOrderHistoryEntry = {
  fromStatus: "RECEIVED",
  toStatus: "PREPARING",
  actorSide: "RESTAURANT",
  occurredAt: PREPARING_AT,
};

describe("toTrackingSteps", () => {
  it("marks the steps already reached as done, with the time each was reached", () => {
    const steps: TrackingStep[] = toTrackingSteps({
      status: "PREPARING",
      history: [CREATED, STARTED],
    });

    expect(steps).toEqual([
      { status: "RECEIVED", state: "done", reachedAt: RECEIVED_AT },
      { status: "PREPARING", state: "current", reachedAt: PREPARING_AT },
      { status: "OUT_FOR_DELIVERY", state: "pending", reachedAt: null },
      { status: "DELIVERED", state: "pending", reachedAt: null },
    ]);
  });

  it("starts with the received step as the current one", () => {
    const steps: TrackingStep[] = toTrackingSteps({ status: "RECEIVED", history: [CREATED] });

    expect(steps.map((step: TrackingStep): string => step.state)).toEqual([
      "current",
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("ends with the delivered step as the current one", () => {
    const steps: TrackingStep[] = toTrackingSteps({ status: "DELIVERED", history: [CREATED] });

    expect(steps.map((step: TrackingStep): string => step.state)).toEqual([
      "done",
      "done",
      "done",
      "current",
    ]);
  });
});
