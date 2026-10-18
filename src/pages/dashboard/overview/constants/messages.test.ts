import { describe, expect, it } from "vitest";
import { DASHBOARD_MESSAGES } from "./messages";

describe("dashboard messages", () => {
  it("tells how many cancellation requests are pending, in the singular for one", () => {
    expect(DASHBOARD_MESSAGES.PENDING_REQUESTS(1)).toBe("1 solicitação de cancelamento pendente");
  });

  it("tells how many cancellation requests are pending, in the plural for more than one", () => {
    expect(DASHBOARD_MESSAGES.PENDING_REQUESTS(3)).toBe("3 solicitações de cancelamento pendentes");
  });

  it("counts cancelled orders out of a single order in the singular", () => {
    expect(DASHBOARD_MESSAGES.CANCELLED_OF(1, 1)).toBe("1 de 1 pedido");
    expect(DASHBOARD_MESSAGES.CANCELLED_OF(51, 1284)).toBe("51 de 1.284 pedidos");
  });
});
