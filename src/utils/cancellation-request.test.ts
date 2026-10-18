import { describe, expect, it } from "vitest";
import type { CancellationRequestStatus } from "@/@types/orders";
import { requestStatusToShow } from "./cancellation-request";

describe("requestStatusToShow", () => {
  it("tells about a declined request while the order is still live", () => {
    const status: CancellationRequestStatus | null = requestStatusToShow("DECLINED", true);

    expect(status).toBe("DECLINED");
  });

  it("stops telling about a declined request once the order is over", () => {
    const status: CancellationRequestStatus | null = requestStatusToShow("DECLINED", false);

    expect(status).toBeNull();
  });

  it("keeps the other outcomes whether or not the order is live", () => {
    const shown: (CancellationRequestStatus | null)[] = [
      requestStatusToShow("PENDING", true),
      requestStatusToShow("PENDING", false),
      requestStatusToShow("APPROVED", false),
    ];

    expect(shown).toEqual(["PENDING", "PENDING", "APPROVED"]);
  });

  it("shows nothing for an order without a request", () => {
    const shown: (CancellationRequestStatus | null)[] = [
      requestStatusToShow(null, true),
      requestStatusToShow(undefined, true),
    ];

    expect(shown).toEqual([null, null]);
  });
});
