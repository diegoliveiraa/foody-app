import type { OrderId } from "@/@types/orders";

export interface OrderListPaths {
  board: string;
  history: string;
  detail: (id: OrderId) => string;
}
