import { describe, expect, it } from "vitest";
import type { StaffOrderSummary } from "@/@types/orders";
import { staffSummary } from "@/test/orders";
import type { BoardColumn } from "../types";
import { toBoardColumns } from "./board-columns";

function numbersOf(column: BoardColumn | undefined): number[] {
  return (column?.orders ?? []).map((order: StaffOrderSummary): number => order.number);
}

describe("toBoardColumns", () => {
  it("splits the board into received, preparing and out for delivery, keeping the API's order", () => {
    const columns: BoardColumn[] = toBoardColumns([
      staffSummary(1038, { status: "OUT_FOR_DELIVERY" }),
      staffSummary(1041, { status: "PREPARING" }),
      staffSummary(1042, { status: "PREPARING" }),
      staffSummary(1043),
      staffSummary(1044),
    ]);

    expect(columns.map((column: BoardColumn): string => column.status)).toEqual([
      "RECEIVED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
    ]);
    expect(columns.map(numbersOf)).toEqual([[1043, 1044], [1041, 1042], [1038]]);
  });

  it("offers cancelling from the card only in the received and preparing columns", () => {
    const columns: BoardColumn[] = toBoardColumns([]);

    expect(columns.map((column: BoardColumn): boolean => column.showsCancel)).toEqual([
      true,
      true,
      false,
    ]);
  });

  it("keeps an empty column for a status without orders", () => {
    const columns: BoardColumn[] = toBoardColumns([staffSummary(1043)]);

    expect(columns.map(numbersOf)).toEqual([[1043], [], []]);
  });
});
