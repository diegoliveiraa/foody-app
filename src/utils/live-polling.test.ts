import { describe, expect, it } from "vitest";
import { livePolling, type LivePolling } from "./live-polling";

describe("livePolling", () => {
  it("polls every 30 seconds, only while the window has focus, when the order is live", () => {
    const options: LivePolling = livePolling(true);

    expect(options).toEqual({ pollingInterval: 30_000, skipPollingIfUnfocused: true });
  });

  it("stops polling once the order is no longer live", () => {
    const options: LivePolling = livePolling(false);

    expect(options.pollingInterval).toBe(0);
  });
});
