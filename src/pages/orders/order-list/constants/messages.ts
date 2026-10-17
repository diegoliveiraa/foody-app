import { MESSAGES } from "@/constants/messages";
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type AdvanceStatus } from "@/constants/orders";

export const ORDER_LIST_MESSAGES = {
  VIEWS: "Visão dos pedidos",
  ACTIVE: "Ativos",
  HISTORY: "Histórico",
  CUSTOMER: "Cliente",
  CUSTOMER_REQUESTED: "Cliente pediu cancelamento",
  VIEW_REQUEST: "Ver solicitação",
} as const;

export const ORDER_ACTION_MESSAGES = {
  CANCEL: MESSAGES.ACTIONS.CANCEL,
  CANCEL_ORDER: MESSAGES.CANCELLATION.CANCEL_ORDER,
  CANCEL_TITLE: (number: number): string =>
    `${MESSAGES.CANCELLATION.CANCEL_ORDER} ${MESSAGES.ORDERS.NUMBER(number)}`,
  CANCEL_DESCRIPTION: "O cliente vê o motivo no acompanhamento do pedido.",
  REASON_LEGEND: "Motivo do cancelamento",
  BACK: "Voltar",
} as const;

export const ADVANCE_LABELS: Record<AdvanceStatus, string> = {
  [ORDER_STATUSES.PREPARING]: "Iniciar preparo",
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: ORDER_STATUS_LABELS.OUT_FOR_DELIVERY,
  [ORDER_STATUSES.DELIVERED]: "Marcar entregue",
};

export const ADVANCED_MESSAGES: Record<AdvanceStatus, (number: number) => string> = {
  [ORDER_STATUSES.PREPARING]: (number: number): string =>
    `${MESSAGES.ORDERS.TITLE(number)} em preparo`,
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: (number: number): string =>
    `${MESSAGES.ORDERS.TITLE(number)} saiu para entrega`,
  [ORDER_STATUSES.DELIVERED]: (number: number): string =>
    `${MESSAGES.ORDERS.TITLE(number)} entregue`,
};
