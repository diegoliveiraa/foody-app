import { describe, expect, it } from "vitest";
import type { Dashboard } from "@/@types/dashboard";
import { dailyBuckets, dashboardResponse, hourlyBuckets, weekDashboard } from "@/test/dashboard";
import type { ChartPoint, OrdersChart } from "../types";
import { toOrdersChart } from "./orders-chart";

const THIRTY_DAYS: readonly number[] = Array.from(
  { length: 30 },
  (_day: unknown, index: number): number => index + 30,
);

function labelsOf(chart: OrdersChart): string[] {
  return chart.points.map((point: ChartPoint): string => point.label);
}

function monthDashboard(): Dashboard {
  return dashboardResponse({
    period: "LAST_30_DAYS",
    ordersOverTime: { granularity: "DAY", points: dailyBuckets(THIRTY_DAYS) },
  });
}

describe("toOrdersChart", () => {
  it("titles today's chart per hour and starts it at the first hour with orders", () => {
    const chart: OrdersChart = toOrdersChart(dashboardResponse());

    expect(chart.title).toBe("Pedidos por hora");
    expect(chart.label).toBe("Pedidos por hora, período Hoje");
    expect(chart.bucketHeader).toBe("Hora");
    expect(labelsOf(chart)).toEqual([
      "11h",
      "12h",
      "13h",
      "14h",
      "15h",
      "16h",
      "17h",
      "18h",
      "19h",
    ]);
    expect(chart.points[0]).toEqual({
      key: "2026-10-17T14:00:00.000Z",
      label: "11h",
      fullLabel: "11h",
      count: 2,
    });
  });

  it("keeps every hour of today while there are no orders yet", () => {
    const chart: OrdersChart = toOrdersChart(
      dashboardResponse({
        ordersOverTime: { granularity: "HOUR", points: hourlyBuckets([0, 0, 0]) },
      }),
    );

    expect(labelsOf(chart)).toEqual(["0h", "1h", "2h"]);
  });

  it("spreads a few ticks from the first to the last bucket", () => {
    const today: OrdersChart = toOrdersChart(dashboardResponse());
    const month: OrdersChart = toOrdersChart(monthDashboard());

    expect(today.ticks).toEqual(["11h", "14h", "16h", "19h"]);
    expect(month.ticks).toEqual(["18/09", "03/10", "17/10"]);
  });

  it("ticks every bucket when there are fewer buckets than ticks", () => {
    const chart: OrdersChart = toOrdersChart(
      dashboardResponse({
        ordersOverTime: { granularity: "HOUR", points: hourlyBuckets([1, 0]) },
      }),
    );

    expect(chart.ticks).toEqual(["0h", "1h"]);
  });

  it("names each of the last 7 days by its weekday in the restaurant's zone, keeping days without orders", () => {
    const chart: OrdersChart = toOrdersChart(
      weekDashboard({
        ordersOverTime: { granularity: "DAY", points: dailyBuckets([0, 0, 36, 44, 52, 58, 43]) },
      }),
    );

    expect(chart.title).toBe("Pedidos por dia");
    expect(chart.label).toBe("Pedidos por dia, período 7 dias");
    expect(chart.bucketHeader).toBe("Dia");
    expect(labelsOf(chart)).toEqual(["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]);
    expect(chart.points[0]?.fullLabel).toBe("dom, 11/10");
    expect(chart.ticks).toEqual(["dom", "qua", "sáb"]);
  });

  it("names each of the last 30 days by day and month", () => {
    const chart: OrdersChart = toOrdersChart(monthDashboard());

    expect(chart.label).toBe("Pedidos por dia, período 30 dias");
    expect(chart.points).toHaveLength(30);
    expect(chart.points[0]?.label).toBe("18/09");
    expect(chart.points[29]?.label).toBe("17/10");
    expect(chart.points[29]?.fullLabel).toBe("sáb, 17/10");
  });
});
