import { describe, expect, it } from "vitest";
import { NO_CANCELLATIONS } from "@/test/dashboard";
import type { CancellationsView, MeterRow } from "../types";
import { toCancellationsView, toStageRows } from "./meter-rows";

describe("toStageRows", () => {
  it("shows the minutes of each stage with a bar relative to the slowest one", () => {
    const rows: MeterRow[] = toStageRows({
      receivedToPreparing: 3,
      preparingToOutForDelivery: 18,
      outForDeliveryToDelivered: 22,
    });

    expect(rows).toEqual([
      {
        key: "receivedToPreparing",
        label: "Recebido → Em preparo",
        value: "3 min",
        widthPercent: 14,
      },
      {
        key: "preparingToOutForDelivery",
        label: "Em preparo → Saiu",
        value: "18 min",
        widthPercent: 82,
      },
      {
        key: "outForDeliveryToDelivered",
        label: "Saiu → Entregue",
        value: "22 min",
        widthPercent: 100,
      },
    ]);
  });

  it("shows a dash and an empty bar for a stage the API has no time for", () => {
    const rows: MeterRow[] = toStageRows({
      receivedToPreparing: null,
      preparingToOutForDelivery: 10,
    });

    expect(
      rows.map(({ value, widthPercent }: MeterRow): [string, number] => [value, widthPercent]),
    ).toEqual([
      ["—", 0],
      ["10 min", 100],
      ["—", 0],
    ]);
  });

  it("leaves every bar empty when no stage has a time", () => {
    const rows: MeterRow[] = toStageRows({ receivedToPreparing: 0 });

    expect(rows.map((row: MeterRow): number => row.widthPercent)).toEqual([0, 0, 0]);
    expect(rows[0]?.value).toBe("0 min");
  });
});

describe("toCancellationsView", () => {
  it("names each reason with who cancelled, with a bar relative to the most frequent", () => {
    const view: CancellationsView = toCancellationsView({
      count: 4,
      ratePercent: 4.2,
      byReason: [
        { reason: "TAKING_TOO_LONG", cancelledBy: "CUSTOMER", count: 3 },
        { reason: "ITEM_UNAVAILABLE", cancelledBy: "RESTAURANT", count: 1 },
      ],
    });

    expect(view).toEqual({
      rate: "4,2% no período",
      rows: [
        {
          key: "TAKING_TOO_LONG-CUSTOMER",
          label: "Está demorando · cliente",
          value: "3",
          widthPercent: 100,
        },
        {
          key: "ITEM_UNAVAILABLE-RESTAURANT",
          label: "Item indisponível · equipe",
          value: "1",
          widthPercent: 33,
        },
      ],
    });
  });

  it("has no rate nor rows when nothing was cancelled in a period without orders", () => {
    const view: CancellationsView = toCancellationsView(NO_CANCELLATIONS);

    expect(view).toEqual({ rate: null, rows: [] });
  });
});
