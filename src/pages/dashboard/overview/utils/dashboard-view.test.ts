import { describe, expect, it } from "vitest";
import { dashboardResponse, NO_PENDING_REQUESTS } from "@/test/dashboard";
import { orderId } from "@/test/orders";
import { formatMoney } from "@/utils/format-money";
import type { DashboardView, TopProductRow } from "../types";
import { toDashboardView } from "./dashboard-view";

describe("toDashboardView", () => {
  it("tells when the numbers were generated, in the restaurant's time zone", () => {
    const view: DashboardView = toDashboardView(dashboardResponse());

    expect(view.updatedAt).toBe("Atualizado às 19:42 · a cada 60 s");
  });

  it("points the banner at the oldest pending cancellation request", () => {
    const view: DashboardView = toDashboardView(dashboardResponse());

    expect(view.pending).toEqual({
      label: "2 solicitações de cancelamento pendentes",
      orderId: orderId(1038),
    });
  });

  it("shows no banner when no request is pending", () => {
    const view: DashboardView = toDashboardView(
      dashboardResponse({ pendingCancellationRequests: NO_PENDING_REQUESTS }),
    );

    expect(view.pending).toBeNull();
  });

  it("counts the active orders under the board's column names", () => {
    const view: DashboardView = toDashboardView(dashboardResponse());

    expect(view.active).toEqual([
      { status: "RECEIVED", label: "Recebidos", count: "3" },
      { status: "PREPARING", label: "Em preparo", count: "2" },
      { status: "OUT_FOR_DELIVERY", label: "Saindo", count: "1" },
    ]);
  });

  it("ranks the best sellers with their units and the revenue the API sent", () => {
    const view: DashboardView = toDashboardView(dashboardResponse());

    expect(view.topProducts[0]).toEqual({
      productId: "0199f2a0-0000-7000-8000-0000000000a1",
      rank: 1,
      name: "Smash duplo",
      units: "21 un",
      revenue: formatMoney(732.9),
    });
    expect(view.topProducts.map((product: TopProductRow): number => product.rank)).toEqual([
      1, 2, 3,
    ]);
  });
});
