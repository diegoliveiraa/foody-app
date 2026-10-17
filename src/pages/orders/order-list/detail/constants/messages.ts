import { MESSAGES } from "@/constants/messages";
import { CANCELLATION_REQUEST_STATUSES, type DecidedRequestStatus } from "@/constants/orders";
import { ORDER_LIST_MESSAGES } from "../../constants/messages";
import type { Decision, DecisionCopy } from "../types";
import { DECISIONS } from "./index";

const ONE_UNIT: number = 1;

export const REQUEST_DECIDED_TITLES: Record<DecidedRequestStatus, string> = {
  [CANCELLATION_REQUEST_STATUSES.APPROVED]: "Cancelamento aprovado",
  [CANCELLATION_REQUEST_STATUSES.DECLINED]: "Cancelamento recusado",
};

export const REQUEST_DECIDED_LABELS: Record<DecidedRequestStatus, string> = {
  [CANCELLATION_REQUEST_STATUSES.APPROVED]: "Solicitação aprovada",
  [CANCELLATION_REQUEST_STATUSES.DECLINED]: "Solicitação recusada",
};

export const ORDER_DETAIL_MESSAGES = {
  TITLE: (number: number, customer: string): string =>
    `${MESSAGES.ORDERS.NUMBER(number)} · ${customer}`,
  PLACED: (when: string, units: string): string => `${when} · ${units}`,
  UNITS: (units: number): string => (units === ONE_UNIT ? `${units} item` : `${units} itens`),
  CUSTOMER: ORDER_LIST_MESSAGES.CUSTOMER,
  HISTORY: ORDER_LIST_MESSAGES.HISTORY,
  CREATED: "Pedido criado",
  REQUEST_CREATED: "Cancelamento solicitado",
  STATUS_CHANGE: (from: string, to: string): string => `${from} → ${to}`,
  ACTOR: (time: string, name: string, side: string): string => `${time} · ${name} (${side})`,
  REASON: MESSAGES.ORDERS.REASON,
  BACK: "Voltar para pedidos",
  CUSTOMER_REQUESTED: ORDER_LIST_MESSAGES.CUSTOMER_REQUESTED,
  REQUESTED_BY: (time: string, name: string): string => `${time} · enviado por ${name}`,
  REQUEST: "Solicitação de cancelamento",
  LINE_SEPARATOR: " · ",
  DECISION_NOTE: "Observação para o cliente (opcional)",
  NEXT_STEP: "Próximo passo",
  DECIDE_FIRST: "Decida a solicitação de cancelamento antes de avançar o pedido.",
} as const;

export const DECISION_COPY: Record<Decision, DecisionCopy> = {
  [DECISIONS.APPROVE]: {
    action: "Aprovar",
    title: (number: number): string =>
      `Aprovar o cancelamento do pedido ${MESSAGES.ORDERS.NUMBER(number)}?`,
    description: "O pedido é cancelado e o cliente vê a resposta no acompanhamento.",
    done: (number: number): string => `Cancelamento aprovado. ${MESSAGES.ORDERS.CANCELLED(number)}`,
  },
  [DECISIONS.DECLINE]: {
    action: "Recusar",
    title: (number: number): string =>
      `Recusar o cancelamento do pedido ${MESSAGES.ORDERS.NUMBER(number)}?`,
    description: "O pedido segue em preparo e o cliente vê a resposta no acompanhamento.",
    done: (): string => "Cancelamento recusado. O pedido segue em preparo",
  },
};
