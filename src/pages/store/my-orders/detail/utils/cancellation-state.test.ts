import { describe, expect, it } from "vitest";
import type { CustomerCancellationRequest, CustomerOrder } from "@/@types/orders";
import { customerOrder } from "@/test/orders";
import type { CancellationGrants, CancellationState } from "../types";
import { cancellationStateOf } from "./cancellation-state";

const BOTH: CancellationGrants = { cancel: true, request: true };

const NONE: CancellationGrants = { cancel: false, request: false };

const PENDING: CustomerCancellationRequest = {
  status: "PENDING",
  reason: "TAKING_TOO_LONG",
  requestedAt: "2026-10-17T22:31:00Z",
};

function preparingWith(cancellationRequest: CustomerCancellationRequest): CustomerOrder {
  return customerOrder(1042, {
    status: "PREPARING",
    canRequestCancellation: false,
    cancellationRequest,
  });
}

describe("cancellationStateOf", () => {
  it("offers to cancel an order the restaurant has not started", () => {
    const state: CancellationState | null = cancellationStateOf(customerOrder(1042), BOTH);

    expect(state).toBe("cancel");
  });

  it("offers to ask for the cancellation once the kitchen started", () => {
    const state: CancellationState | null = cancellationStateOf(
      customerOrder(1042, { status: "PREPARING" }),
      BOTH,
    );

    expect(state).toBe("request");
  });

  it("offers nothing the customer's grants do not allow", () => {
    const received: CancellationState | null = cancellationStateOf(customerOrder(1042), NONE);
    const preparing: CancellationState | null = cancellationStateOf(
      customerOrder(1042, { status: "PREPARING" }),
      NONE,
    );

    expect([received, preparing]).toEqual([null, null]);
  });

  it("tells the customer the request is waiting for the restaurant", () => {
    const state: CancellationState | null = cancellationStateOf(preparingWith(PENDING), BOTH);

    expect(state).toBe("pending");
  });

  it("tells the customer the restaurant declined the request", () => {
    const state: CancellationState | null = cancellationStateOf(
      preparingWith({ ...PENDING, status: "DECLINED", decidedAt: "2026-10-17T22:34:00Z" }),
      BOTH,
    );

    expect(state).toBe("declined");
  });

  it("stops telling about the declined request once the order is over", () => {
    const state: CancellationState | null = cancellationStateOf(
      customerOrder(1042, {
        status: "DELIVERED",
        live: false,
        cancellationRequest: {
          ...PENDING,
          status: "DECLINED",
          decidedAt: "2026-10-17T22:34:00Z",
          decisionNote: "Já saiu para entrega",
        },
      }),
      BOTH,
    );

    expect(state).toBeNull();
  });

  it("shows nothing for an order that can no longer change, or was cancelled on request", () => {
    const delivered: CancellationState | null = cancellationStateOf(
      customerOrder(1042, { status: "DELIVERED", live: false }),
      BOTH,
    );
    const approved: CancellationState | null = cancellationStateOf(
      customerOrder(1042, {
        status: "CANCELLED",
        live: false,
        cancellationRequest: { ...PENDING, status: "APPROVED" },
      }),
      BOTH,
    );

    expect([delivered, approved]).toEqual([null, null]);
  });
});
