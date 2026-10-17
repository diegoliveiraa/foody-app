import type { OrderStatus } from "@/@types/orders";
import { ORDER_STATUSES } from "@/constants/orders";

export const STEP_HINTS: Partial<Record<OrderStatus, string>> = {
  [ORDER_STATUSES.RECEIVED]: "o restaurante recebeu seu pedido",
  [ORDER_STATUSES.PREPARING]: "a cozinha já começou",
};

export const TRACKING_MESSAGES = {
  BACK: "Voltar para meus pedidos",
  STATUS: "Status do pedido",
  STATUS_NOW: "Status agora",
  LIVE: "Atualiza sozinho",
  TIMELINE: "Andamento do pedido",
  STEP_SEPARATOR: " · ",
  BACK_TO_LIST: "Ver meus pedidos",
} as const;
