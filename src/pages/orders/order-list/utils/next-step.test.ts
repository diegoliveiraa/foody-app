import { describe, expect, it } from "vitest";
import type { OrderStatus } from "@/@types/orders";
import type { NextStep } from "../types";
import { toNextStep } from "./next-step";

const STEPS: readonly [OrderStatus, string, string][] = [
  ["PREPARING", "Iniciar preparo", "Pedido #1042 em preparo"],
  ["OUT_FOR_DELIVERY", "Saiu para entrega", "Pedido #1042 saiu para entrega"],
  ["DELIVERED", "Marcar entregue", "Pedido #1042 entregue"],
];

describe("toNextStep", () => {
  it.each(STEPS)(
    "names the move to %s '%s' and confirms it with '%s'",
    (status: OrderStatus, label: string, done: string) => {
      const step: NextStep | null = toNextStep([status]);

      expect(step?.status).toBe(status);
      expect(step?.label).toBe(label);
      expect(step?.done(1042)).toBe(done);
    },
  );

  it("offers no step when the API allows no move", () => {
    expect(toNextStep([])).toBeNull();
  });

  it("offers no step for a move that is not an advance", () => {
    expect(toNextStep(["CANCELLED"])).toBeNull();
    expect(toNextStep(["RECEIVED"])).toBeNull();
  });
});
