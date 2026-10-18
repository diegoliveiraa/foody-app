import { describe, expect, it } from "vitest";
import type { Dashboard } from "@/@types/dashboard";
import { dashboardResponse, NO_CANCELLATIONS } from "@/test/dashboard";
import { formatMoney } from "@/utils/format-money";
import type { KpiCard } from "../types";
import { toKpiCards } from "./kpi-cards";

function cardsOf(changes: Partial<Dashboard> = {}): KpiCard[] {
  return toKpiCards(dashboardResponse(changes));
}

describe("toKpiCards", () => {
  it("shows the orders of the period and a rise against yesterday in green", () => {
    const [orders] = cardsOf();

    expect(orders).toEqual({
      label: "Pedidos",
      value: "48",
      detail: "+12% vs ontem",
      tone: "UP",
    });
  });

  it("shows a fall against the previous 30 days in red, with grouped thousands", () => {
    const [orders] = cardsOf({
      period: "LAST_30_DAYS",
      orders: { count: 1284, previousCount: 1310, changePercent: -2 },
    });

    expect(orders).toEqual({
      label: "Pedidos",
      value: "1.284",
      detail: "-2% vs 30 dias anteriores",
      tone: "DOWN",
    });
  });

  it("shows no change against the previous 7 days as neutral", () => {
    const [orders] = cardsOf({
      period: "LAST_7_DAYS",
      orders: { count: 312, previousCount: 312, changePercent: 0 },
    });

    expect(orders?.detail).toBe("0% vs 7 dias anteriores");
    expect(orders?.tone).toBe("NEUTRAL");
  });

  it("says the previous period had no orders instead of a change when the API sends none", () => {
    const [orders] = cardsOf({ orders: { count: 5, previousCount: 0, changePercent: null } });

    expect(orders?.detail).toBe("Sem pedidos no período anterior");
    expect(orders?.tone).toBe("MUTED");
  });

  it("shows revenue and average ticket as the API sent them, counting delivered orders", () => {
    const [, revenue, ticket] = cardsOf();

    expect(revenue).toEqual({
      label: "Faturamento",
      value: formatMoney(2847.6),
      detail: "pedidos entregues",
      tone: "MUTED",
    });
    expect(ticket).toEqual({
      label: "Ticket médio",
      value: formatMoney(59.32),
      detail: "por pedido entregue",
      tone: "MUTED",
    });
  });

  it("shows a dash for the average ticket when nothing was delivered", () => {
    const [, , ticket] = cardsOf({ averageTicket: null });

    expect(ticket?.value).toBe("—");
  });

  it("shows the cancellation rate and how many of the orders were cancelled", () => {
    const [, , , cancellations] = cardsOf();

    expect(cancellations).toEqual({
      label: "Cancelamentos",
      value: "4,2%",
      detail: "2 de 48 pedidos",
      tone: "MUTED",
    });
  });

  it("shows a dash for the cancellation rate when the period has no orders", () => {
    const [, , , cancellations] = cardsOf({
      orders: { count: 0, previousCount: 0, changePercent: null },
      cancellations: NO_CANCELLATIONS,
    });

    expect(cancellations?.value).toBe("—");
    expect(cancellations?.detail).toBe("0 de 0 pedidos");
  });
});
