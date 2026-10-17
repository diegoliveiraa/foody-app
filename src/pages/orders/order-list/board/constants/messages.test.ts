import { describe, expect, it } from "vitest";
import { BOARD_MESSAGES } from "./messages";

describe("board messages", () => {
  it("tells how many cancellation requests are waiting, in the singular for one", () => {
    expect(BOARD_MESSAGES.PENDING_REQUESTS(1)).toBe(
      "1 solicitação de cancelamento aguardando você",
    );
  });

  it("tells how many cancellation requests are waiting, in the plural for more than one", () => {
    expect(BOARD_MESSAGES.PENDING_REQUESTS(2)).toBe(
      "2 solicitações de cancelamento aguardando você",
    );
    expect(BOARD_MESSAGES.PENDING_REQUESTS(12)).toBe(
      "12 solicitações de cancelamento aguardando você",
    );
  });
});
