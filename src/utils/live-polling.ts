import { LIVE_ORDER_POLLING_MS, NO_POLLING_MS } from "@/constants/orders";

export interface LivePolling {
  pollingInterval: number;
  skipPollingIfUnfocused: boolean;
}

export function livePolling(live: boolean): LivePolling {
  return {
    pollingInterval: live ? LIVE_ORDER_POLLING_MS : NO_POLLING_MS,
    skipPollingIfUnfocused: true,
  };
}
